// 多设备同步。本地照常读写浏览器数据库（离线可用），这里负责把改动传到服务器、把其他设备的改动拉回来。
// 服务器是同一网址下的 api/（见 server/barin_sync.py）；没有部署服务器的地方（如 GitHub Pages）保持关闭即可。
import { useSyncExternalStore } from 'react'
import { applyRemote, clearPending, markAllPending, nextPendingBatch, pendingCount, setLocalChangeListener, type Change } from './db'
import { DAY } from './logic'

// localStorage 可能不可用（隐私模式等），读写都要兜底；此时同步只在本次打开期间有效
const K = { code: 'syncCode', epoch: 'syncEpoch', cursor: 'syncCursor', lastAt: 'syncLastAt' }
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* 忽略 */ } },
  del: (k: string) => { try { localStorage.removeItem(k) } catch { /* 忽略 */ } },
}

let code = ls.get(K.code) ?? '' // 同步口令，空表示未开启
let epoch = ls.get(K.epoch) // 服务器数据库的标识，换了说明服务器重建或恢复过
let cursor = Number(ls.get(K.cursor)) || 0 // 已经拉到服务器的第几条改动

// offline 表示连不上（离线使用时的常态），界面上不当作故障提示
export interface SyncState { enabled: boolean; busy: boolean; lastAt: number | null; pending: number; error: string; offline: boolean }
let state: SyncState = { enabled: !!code, busy: false, lastAt: Number(ls.get(K.lastAt)) || null, pending: 0, error: '', offline: false }
const listeners = new Set<() => void>()
const set = (patch: Partial<SyncState>) => { state = { ...state, ...patch }; listeners.forEach(f => f()) }
const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f) } }
export const getSyncState = () => state
export const useSyncState = () => useSyncExternalStore(subscribe, getSyncState)
// 最近同步成功过：服务器上有一份，不必再提醒“很久没备份”
export const syncedRecently = (now = Date.now()) => state.enabled && state.lastAt != null && now - state.lastAt < 14 * DAY

class SyncError extends Error {
  offline: boolean
  constructor(msg: string, offline = false) { super(msg); this.offline = offline }
}

interface Reply { epoch: string; reset?: boolean; seq: number; more: boolean; changes: Change[] }

async function call(path: string, token: string, body?: unknown) {
  let res: Response
  try {
    res = await fetch(new URL(`api/${path}`, document.baseURI), {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new SyncError('连不上服务器，联网后会自动重试', true)
  }
  if (res.status === 401) throw new SyncError('同步口令不正确')
  if (res.status === 404 || res.status === 405) throw new SyncError('这个网址没有同步服务')
  if (res.status === 413) throw new SyncError('有内容过大，服务器拒收')
  if (res.status === 429) throw new SyncError('请求太频繁，稍后会自动重试', true)
  if (!res.ok) throw new SyncError(`服务器出错（${res.status}）`)
  try { return await res.json() } catch { throw new SyncError('这个网址没有同步服务') }
}

let onRemote: (() => void) | undefined

// 一轮同步：先把服务器上的改动拉完，再分批上传本地的
async function once() {
  for (let more = true, resets = 0; code;) {
    const batch = more ? [] : await nextPendingBatch()
    if (!more && !batch.length) break
    const r: Reply = await call('sync', code, { epoch, since: cursor, changes: batch })
    if (r.reset) {
      // 服务器的数据库换过了（重装或从备份恢复）：从头拉取，并把本地内容全部重新上传
      if (++resets > 2) throw new SyncError('服务器状态异常')
      epoch = r.epoch
      cursor = 0
      await markAllPending()
      more = true
    } else {
      const applied = await applyRemote(r.changes)
      await clearPending(batch)
      epoch = r.epoch
      cursor = r.seq
      more = r.more
      if (applied) onRemote?.()
    }
    ls.set(K.epoch, r.epoch)
    ls.set(K.cursor, String(cursor))
  }
}

let running: Promise<void> | null = null
let rerun = false

// 立即同步。已经在同步时不重复发起，结束后再补一轮
export function syncNow(): Promise<void> {
  if (!code) return Promise.resolve()
  if (running) { rerun = true; return running }
  running = (async () => {
    set({ busy: true })
    try {
      do { rerun = false; await once() } while (rerun && code)
      if (code) {
        const now = Date.now()
        ls.set(K.lastAt, String(now))
        set({ lastAt: now, error: '', offline: false })
      }
    } catch (e) {
      if (code) set({ error: e instanceof SyncError ? e.message : `同步出错：${(e as Error).message}`, offline: e instanceof SyncError && e.offline })
    } finally {
      running = null
      set({ busy: false, pending: await pendingCount().catch(() => 0) })
    }
  })()
  return running
}

let timer: ReturnType<typeof setTimeout> | undefined
const schedule = (ms: number) => { clearTimeout(timer); timer = setTimeout(syncNow, ms) }

// 应用启动时调用：启动时、本地有改动后、回到前台或恢复联网时自动同步。返回停止函数
export function startSync(onRemoteApplied: () => void) {
  onRemote = onRemoteApplied
  const soon = () => schedule(0)
  setLocalChangeListener(() => {
    if (!code) return
    pendingCount().then(pending => set({ pending })).catch(() => {})
    schedule(1500) // 连续保存（如批量记录）合并成一次上传
  })
  document.addEventListener('visibilitychange', soon)
  window.addEventListener('online', soon)
  const every = setInterval(() => { if (document.visibilityState === 'visible') soon() }, 5 * 60_000)
  soon()
  return () => {
    setLocalChangeListener()
    document.removeEventListener('visibilitychange', soon)
    window.removeEventListener('online', soon)
    clearInterval(every)
    clearTimeout(timer)
    onRemote = undefined
  }
}

// 开启同步：先向服务器校验口令，再把本地已有的内容和服务器上的合并
export async function enableSync(input: string) {
  const token = input.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!token) throw new SyncError('请输入同步口令')
  await call('check', token)
  code = token
  epoch = null
  cursor = 0
  ls.set(K.code, token)
  ls.del(K.epoch)
  ls.del(K.cursor)
  await markAllPending()
  set({ enabled: true, lastAt: null, error: '', offline: false })
  await syncNow()
}

// 在本设备关闭同步：本地数据和服务器上的数据都保留
export function disableSync() {
  code = ''
  epoch = null
  cursor = 0
  Object.values(K).forEach(ls.del)
  set({ enabled: false, busy: false, lastAt: null, pending: 0, error: '', offline: false })
}
