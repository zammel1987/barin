"""同步服务的测试：python -m unittest（在 server/ 目录下运行）。"""
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

import barin_sync
from barin_sync import Server, Store, check_changes, load_token, norm_token


# 测试只访问本机，不走系统代理
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def ch(kind, id_, at, deleted=False, **data):
    c = {'kind': kind, 'id': id_, 'updatedAt': at, 'deleted': deleted}
    if not deleted:
        c['data'] = {'id': id_, **data}
    return c


class StoreTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = Store(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        self.addCleanup(self.store.close)

    def sync(self, since=0, changes=(), epoch=None):
        return self.store.sync(epoch, since, check_changes(list(changes)))

    def test_push_then_other_device_pulls(self):
        a = self.sync(changes=[ch('pet', 'p1', 100, name='小青'), ch('record', 'r1', 101, petId='p1')])
        self.assertEqual((a['seq'], a['more'], a['changes']), (2, False, []))  # 不回传自己刚写入的
        b = self.sync(since=0)
        self.assertEqual([c['id'] for c in b['changes']], ['p1', 'r1'])
        self.assertEqual(b['changes'][0]['data'], {'id': 'p1', 'name': '小青'})
        self.assertEqual(b['seq'], 2)
        self.assertEqual(self.sync(since=2)['changes'], [])

    def test_newer_wins_older_ignored(self):
        self.sync(changes=[ch('pet', 'p1', 200, name='新')])
        self.sync(changes=[ch('pet', 'p1', 150, name='旧')])
        self.assertEqual(self.sync()['changes'][0]['data']['name'], '新')
        r = self.sync(changes=[ch('pet', 'p1', 300, name='更新')])
        self.assertEqual(r['seq'], 2)
        got = self.sync(since=1)['changes']
        self.assertEqual([(c['id'], c['data']['name']) for c in got], [('p1', '更新')])

    def test_delete_is_a_change_and_wins_ties(self):
        self.sync(changes=[ch('record', 'r1', 100, petId='p1')])
        self.sync(changes=[ch('record', 'r1', 100, deleted=True)])  # 时间相同，删除优先
        c = self.sync()['changes'][0]
        self.assertEqual((c['deleted'], 'data' in c), (True, False))
        self.sync(changes=[ch('record', 'r1', 100, petId='p1')])  # 同一时间的旧内容不能把它救回来
        self.assertTrue(self.sync()['changes'][0]['deleted'])
        self.sync(changes=[ch('record', 'r1', 101, petId='p1')])  # 之后重新创建可以
        self.assertFalse(self.sync()['changes'][0]['deleted'])

    def test_push_returns_only_other_devices_changes(self):
        self.sync(changes=[ch('pet', 'a', 1)])
        self.sync(changes=[ch('pet', 'b', 2)])
        r = self.sync(since=1, changes=[ch('pet', 'c', 3)])
        self.assertEqual([c['id'] for c in r['changes']], ['b'])
        self.assertEqual(r['seq'], 3)

    def test_paging(self):
        old = barin_sync.PAGE_ROWS
        barin_sync.PAGE_ROWS = 2
        self.addCleanup(setattr, barin_sync, 'PAGE_ROWS', old)
        self.sync(changes=[ch('record', f'r{i}', i) for i in range(5)])
        seen, since = [], 0
        for _ in range(10):
            r = self.sync(since=since)
            seen += [c['id'] for c in r['changes']]
            since = r['seq']
            if not r['more']:
                break
        self.assertEqual(seen, ['r0', 'r1', 'r2', 'r3', 'r4'])
        self.assertEqual(since, 5)

    def test_epoch_mismatch_asks_for_reset_and_writes_nothing(self):
        r = self.sync(epoch='someone-else', changes=[ch('pet', 'p1', 1)])
        self.assertEqual(r, {'epoch': self.store.epoch, 'reset': True})
        self.assertEqual(self.sync(epoch=self.store.epoch)['changes'], [])
        old = self.store.epoch
        self.store.new_epoch()
        self.assertTrue(self.sync(epoch=old).get('reset'))

    def test_epoch_survives_restart(self):
        epoch = self.store.epoch
        self.sync(changes=[ch('pet', 'p1', 1)])
        again = Store(self.tmp.name)
        self.addCleanup(again.close)
        self.assertEqual(again.epoch, epoch)
        self.assertEqual(len(again.sync(None, 0, [])['changes']), 1)

    def test_daily_backup_before_first_write(self):
        self.sync(changes=[ch('pet', 'p1', 1)])
        self.sync(changes=[ch('pet', 'p2', 2)])
        files = list((Path(self.tmp.name) / 'backups').glob('barin-*.db'))
        self.assertEqual(len(files), 1)  # 一天一份
        self.sync()  # 只拉取不触发备份
        self.assertEqual(len(list((Path(self.tmp.name) / 'backups').iterdir())), 1)

    def test_old_backups_are_pruned(self):
        folder = Path(self.tmp.name) / 'backups'
        folder.mkdir()
        for d in range(1, 21):
            (folder / f'barin-200001{d:02d}.db').write_bytes(b'')
        self.sync(changes=[ch('pet', 'p1', 1)])
        names = sorted(p.name for p in folder.iterdir())
        self.assertEqual(len(names), barin_sync.KEEP_BACKUPS)
        self.assertEqual(names[0], 'barin-20000108.db')


class ValidateTest(unittest.TestCase):
    def test_rejects_bad_changes(self):
        bad = [
            'x', [1], [{'kind': 'user', 'id': 'a', 'updatedAt': 1, 'deleted': True}],
            [{'kind': 'pet', 'id': '', 'updatedAt': 1, 'deleted': True}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': True, 'deleted': True}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': 1.5, 'deleted': True}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': -1, 'deleted': True}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': 1, 'deleted': 0}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': 1, 'deleted': False}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': 1, 'deleted': False, 'data': {'id': 'b'}}],
            [{'kind': 'pet', 'id': 'a', 'updatedAt': 1, 'deleted': False, 'data': {'id': 'a', 'x': 'y' * barin_sync.MAX_ITEM}}],
        ]
        for raw in bad:
            with self.assertRaises(barin_sync.BadRequest, msg=str(raw)[:80]):
                check_changes(raw)

    def test_token(self):
        self.assertEqual(norm_token(' AbCde-fGhjk 23456\n'), 'abcdefghjk23456')
        with tempfile.TemporaryDirectory() as d:
            t = load_token(d)
            self.assertEqual(len(t), 20)
            self.assertEqual(load_token(d), t)  # 再次启动不会换口令


class HttpTest(unittest.TestCase):
    TOKEN = 'testa-testb-testc-testd'

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        store = Store(self.tmp.name)
        self.server = Server(('127.0.0.1', 0), store, norm_token(self.TOKEN))
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.base = 'http://127.0.0.1:%d' % self.server.server_address[1]
        self.addCleanup(self.tmp.cleanup)
        self.addCleanup(store.close)
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)

    def call(self, path, body=None, token=TOKEN, raw=None, headers=None):
        data = raw if raw is not None else None if body is None else json.dumps(body).encode()
        req = urllib.request.Request(self.base + path, data=data, headers=headers or {})
        if token:
            req.add_header('Authorization', 'Bearer ' + token)
        try:
            with OPENER.open(req, timeout=5) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            with e:
                return e.code, json.loads(e.read())

    def test_health_needs_no_token(self):
        self.assertEqual(self.call('/api/health', token=None), (200, {'ok': True}))

    def test_auth(self):
        self.assertEqual(self.call('/api/check', token=None)[0], 401)
        self.assertEqual(self.call('/api/check', token='wrong-token')[0], 401)
        self.assertEqual(self.call('/api/check')[0], 200)
        self.assertEqual(self.call('/api/check', token='TESTA testb-TESTC testd')[0], 200)  # 大小写、空格不敏感
        self.assertEqual(self.call('/api/sync', {'since': 0}, token=None)[0], 401)
        self.assertEqual(self.call('/api/sync', {'since': 0}, token='')[0], 401)

    def test_sync_roundtrip_between_two_devices(self):
        s, a = self.call('/api/sync', {'epoch': None, 'since': 0, 'changes': [ch('pet', 'p1', 10, name='玉米蛇')]})
        self.assertEqual((s, a['seq'], a['changes']), (200, 1, []))
        s, b = self.call('/api/sync', {'epoch': a['epoch'], 'since': 0, 'changes': []})
        self.assertEqual(b['changes'][0]['data']['name'], '玉米蛇')
        self.call('/api/sync', {'epoch': a['epoch'], 'since': 1, 'changes': [ch('pet', 'p1', 20, deleted=True)]})
        s, a2 = self.call('/api/sync', {'epoch': a['epoch'], 'since': 1, 'changes': []})
        self.assertEqual([(c['id'], c['deleted']) for c in a2['changes']], [('p1', True)])

    def test_bad_requests(self):
        self.assertEqual(self.call('/api/sync', raw=b'{not json')[0], 400)
        self.assertEqual(self.call('/api/sync', [1, 2])[0], 400)
        self.assertEqual(self.call('/api/sync', {'since': -1})[0], 400)
        self.assertEqual(self.call('/api/sync', {'since': 0, 'changes': [{'kind': 'x'}]})[0], 400)
        self.assertEqual(self.call('/api/nope', {})[0], 404)
        self.assertEqual(self.call('/nope')[0], 404)

    def test_too_large(self):
        status, _ = self.call('/api/sync', raw=b'{}', headers={'Content-Length': str(barin_sync.MAX_BODY + 1)})
        self.assertEqual(status, 413)


if __name__ == '__main__':
    unittest.main()
