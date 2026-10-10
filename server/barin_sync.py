#!/usr/bin/env python3
"""爬宠饲养记录的同步服务。

只用 Python 标准库和 SQLite，不需要安装任何依赖。只有一份数据、一个同步口令，没有账号。

    python3 barin_sync.py              启动服务
    python3 barin_sync.py new-epoch    从备份恢复数据库之后执行一次（先停服务），让各设备重新全量同步

接口（放在反向代理的 /api/ 下，口令放在 Authorization: Bearer 里）：
    GET  /api/health   不需要口令，只回答服务是否在运行
    GET  /api/check    校验口令
    POST /api/sync     {epoch, since, changes} -> {epoch, seq, more, changes}，或 {epoch, reset: true}

合并规则：每只宠物、每条记录各自比较修改时间，新的覆盖旧的；删除也是一条改动（墓碑）。
时间相同时删除优先。服务器给每条被接受的改动一个递增的序号 seq，设备记住自己拉到了哪个序号。
"""
import hmac
import json
import os
import re
import secrets
import sqlite3
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

MAX_BODY = 8 * 1024 * 1024    # 单次请求体上限
MAX_ITEM = 1024 * 1024        # 单条内容上限（带照片的记录一般 100–400 KB）
MAX_CHANGES = 1000            # 单次请求的改动条数上限
PAGE_BYTES = 4 * 1024 * 1024  # 单次返回的内容上限，超过则分页
PAGE_ROWS = 200
KEEP_BACKUPS = 14             # 每日备份保留份数
MAX_TIME = 2 ** 53            # JS 能精确表示的最大整数
TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'  # 去掉了容易看错的 0 o 1 l i


class BadRequest(Exception):
    pass


def norm_token(s):
    """口令比较前的归一化：忽略大小写、空格和连字符。"""
    return re.sub(r'[^a-z0-9]', '', s.lower())


def new_token():
    chars = ''.join(secrets.choice(TOKEN_ALPHABET) for _ in range(20))
    return '-'.join(chars[i:i + 5] for i in range(0, 20, 5))


def load_token(data_dir):
    """读取同步口令；首次启动时生成，文件只有服务自己的用户能读。口令不会写进日志。"""
    path = Path(data_dir) / 'token'
    if not path.exists():
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(new_token() + '\n')
        print(f'已生成同步口令，保存在 {path}', flush=True)
    token = norm_token(path.read_text(encoding='utf-8'))
    if len(token) < 12:
        raise SystemExit(f'{path} 里的口令太短（至少 12 个字母或数字）')
    return token


def check_changes(raw):
    """校验客户端发来的改动，返回 (kind, id, updated_at, deleted, data_json) 列表。"""
    if not isinstance(raw, list) or len(raw) > MAX_CHANGES:
        raise BadRequest('changes 应为数组，且不超过 %d 条' % MAX_CHANGES)
    out = []
    for c in raw:
        if not isinstance(c, dict):
            raise BadRequest('改动格式不正确')
        kind, id_, at, deleted, data = c.get('kind'), c.get('id'), c.get('updatedAt'), c.get('deleted'), c.get('data')
        if kind not in ('pet', 'record'):
            raise BadRequest('未知的类型')
        if not isinstance(id_, str) or not 0 < len(id_) <= 100:
            raise BadRequest('id 不正确')
        if isinstance(at, bool) or not isinstance(at, int) or not 0 <= at <= MAX_TIME:
            raise BadRequest('updatedAt 不正确')
        if not isinstance(deleted, bool):
            raise BadRequest('deleted 不正确')
        text = None
        if not deleted:
            if not isinstance(data, dict) or data.get('id') != id_:
                raise BadRequest('data 不正确')
            text = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            if len(text.encode('utf-8')) > MAX_ITEM:
                raise BadRequest('单条内容过大')
        out.append((kind, id_, at, deleted, text))
    return out


class Store:
    def __init__(self, data_dir):
        self.dir = Path(data_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.lock = threading.Lock()
        # 自己控制事务（isolation_level=None），所有访问都在 self.lock 内
        self.db = sqlite3.connect(self.dir / 'barin.db', check_same_thread=False, isolation_level=None)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('''CREATE TABLE IF NOT EXISTS items (
            kind TEXT NOT NULL, id TEXT NOT NULL, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL,
            data TEXT, seq INTEGER NOT NULL, PRIMARY KEY (kind, id))''')
        self.db.execute('CREATE UNIQUE INDEX IF NOT EXISTS items_seq ON items (seq)')
        self.db.execute('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        # epoch 标识“这一份数据库”。数据库重建或从备份恢复后 epoch 会变，设备发现后重新全量同步
        self.db.execute("INSERT OR IGNORE INTO meta VALUES ('epoch', ?)", (secrets.token_hex(8),))
        self.epoch = self.db.execute("SELECT value FROM meta WHERE key = 'epoch'").fetchone()[0]

    def new_epoch(self):
        with self.lock:
            self.epoch = secrets.token_hex(8)
            self.db.execute("UPDATE meta SET value = ? WHERE key = 'epoch'", (self.epoch,))

    def close(self):
        with self.lock:
            self.db.close()

    def _daily_backup(self):
        """当天第一次有改动写入之前，先把数据库完整复制一份。"""
        folder = self.dir / 'backups'
        target = folder / time.strftime('barin-%Y%m%d.db')
        if target.exists():
            return
        folder.mkdir(exist_ok=True)
        tmp = target.with_suffix('.tmp')
        tmp.unlink(missing_ok=True)
        dst = sqlite3.connect(tmp)
        try:
            self.db.backup(dst)
        finally:
            dst.close()
        os.replace(tmp, target)
        for old in sorted(folder.glob('barin-*.db'))[:-KEEP_BACKUPS]:
            old.unlink()

    def sync(self, epoch, since, changes):
        """写入客户端的改动，返回 since 之后其他设备的改动（不含本次刚写入的）。"""
        with self.lock:
            if epoch is not None and epoch != self.epoch:
                return {'epoch': self.epoch, 'reset': True}
            if changes:
                self._daily_backup()
            self.db.execute('BEGIN IMMEDIATE')
            try:
                before = seq = self.db.execute('SELECT COALESCE(MAX(seq), 0) FROM items').fetchone()[0]
                for kind, id_, at, deleted, text in changes:
                    row = self.db.execute('SELECT updated_at, deleted FROM items WHERE kind = ? AND id = ?', (kind, id_)).fetchone()
                    if row and not (at > row[0] or (at == row[0] and deleted and not row[1])):
                        continue  # 服务器上的更新（或一样新），忽略这条
                    seq += 1
                    self.db.execute('INSERT OR REPLACE INTO items VALUES (?, ?, ?, ?, ?, ?)', (kind, id_, at, int(deleted), text, seq))
                out, size, more, last = [], 0, False, since
                rows = self.db.execute('SELECT kind, id, updated_at, deleted, data, seq FROM items WHERE seq > ? AND seq <= ? ORDER BY seq', (since, before))
                for kind, id_, at, deleted, text, s in rows:
                    if out and (len(out) >= PAGE_ROWS or size + len(text or '') > PAGE_BYTES):
                        more = True
                        break
                    item = {'kind': kind, 'id': id_, 'updatedAt': at, 'deleted': bool(deleted)}
                    if text is not None:
                        item['data'] = json.loads(text)
                    out.append(item)
                    size += len(text or '')
                    last = s
                self.db.execute('COMMIT')
            except BaseException:
                self.db.execute('ROLLBACK')
                raise
        return {'epoch': self.epoch, 'seq': last if more else seq, 'more': more, 'changes': out}


class Handler(BaseHTTPRequestHandler):
    server_version = 'barin-sync'
    sys_version = ''
    timeout = 30

    def log_message(self, format, *args):
        pass  # 访问日志由前面的 nginx 记录

    def _send(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def _authed(self):
        h = self.headers.get('Authorization', '')
        given = norm_token(h[7:]) if h.startswith('Bearer ') else ''
        return hmac.compare_digest(given.encode(), self.server.token.encode())

    def _path(self):
        return self.path.split('?', 1)[0]

    def do_GET(self):
        path = self._path()
        if path == '/api/health':
            self._send(200, {'ok': True})
        elif path == '/api/check':
            self._send(200, {'ok': True}) if self._authed() else self._send(401, {'error': '同步口令不正确'})
        else:
            self._send(404, {'error': 'not found'})

    def do_POST(self):
        if self._path() != '/api/sync':
            return self._send(404, {'error': 'not found'})
        if not self._authed():
            return self._send(401, {'error': '同步口令不正确'})
        try:
            length = int(self.headers.get('Content-Length', ''))
        except ValueError:
            return self._send(411, {'error': '缺少 Content-Length'})
        if not 0 <= length <= MAX_BODY:
            return self._send(413, {'error': '请求过大'})
        try:
            try:
                body = json.loads(self.rfile.read(length))
            except ValueError:
                raise BadRequest('不是合法的 JSON')
            if not isinstance(body, dict):
                raise BadRequest('请求格式不正确')
            epoch, since = body.get('epoch'), body.get('since', 0)
            if epoch is not None and not isinstance(epoch, str):
                raise BadRequest('epoch 不正确')
            if isinstance(since, bool) or not isinstance(since, int) or since < 0:
                raise BadRequest('since 不正确')
            changes = check_changes(body.get('changes', []))
        except BadRequest as e:
            return self._send(400, {'error': str(e)})
        self._send(200, self.server.store.sync(epoch, since, changes))


class Server(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, addr, store, token):
        super().__init__(addr, Handler)
        self.store = store
        self.token = token


def main():
    data_dir = os.environ.get('BARIN_DATA', '/var/lib/barin-sync')
    store = Store(data_dir)
    if sys.argv[1:] == ['new-epoch']:
        store.new_epoch()
        print('已更换 epoch，各设备下次同步时会重新全量同步')
        return
    if sys.argv[1:]:
        raise SystemExit(__doc__)
    addr = (os.environ.get('BARIN_HOST', '127.0.0.1'), int(os.environ.get('BARIN_PORT', '8787')))
    server = Server(addr, store, load_token(data_dir))
    print(f'barin-sync 监听 {addr[0]}:{addr[1]}，数据目录 {data_dir}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
