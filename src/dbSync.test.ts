import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { openDB } from 'idb'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { remoteWins, versionOf } from './db'
import type { LogRecord, Pet } from './types'

type Db = typeof import('./db')

// 每台“设备”有独立的浏览器数据库和独立加载的 db 模块；seed 用来预先放入旧版数据
async function device(seed?: () => Promise<void>): Promise<Db> {
  vi.resetModules()
  globalThis.indexedDB = new IDBFactory() as unknown as typeof indexedDB
  await seed?.()
  const db = await import('./db')
  await db.getAll() // 立刻打开，绑定到这台设备的数据库
  return db
}
// 模拟“设备 → 服务器 → 另一台设备”：把一台的待上传改动合并到另一台
async function send(from: Db, to: Db) {
  const batch = await from.nextPendingBatch()
  const applied = await to.applyRemote(batch)
  await from.clearPending(batch)
  return { batch, applied }
}
const at = (t: number) => vi.spyOn(Date, 'now').mockReturnValue(t)
const pet = (id: string, extra: Partial<Pet> = {}): Pet => ({ id, name: id, species: 'spider', breed: '', sex: 'unknown', acquiredAt: '2026-01-01', notes: '', createdAt: 1000, ...extra })
const rec = (id: string, petId: string, extra: Partial<LogRecord> = {}): LogRecord => ({ id, petId, type: 'feed', at: 2000, note: '', ...extra })
const ids = (xs: { id: string }[]) => xs.map(x => x.id).sort()

// 两台设备都已有 p1 和它的记录 r1，且都没有待上传的内容
async function pair() {
  const a = await device()
  const b = await device()
  at(3000)
  await a.putRecordAndPet(rec('r1', 'p1'), pet('p1'))
  await send(a, b)
  return { a, b }
}

afterEach(() => { vi.restoreAllMocks() })

describe('比较新旧', () => {
  it('旧版数据没有修改时间，按创建时间算', () => {
    expect(versionOf('pet', pet('p', { createdAt: 111 }))).toBe(111)
    expect(versionOf('record', rec('r', 'p', { at: 222 }))).toBe(222)
    expect(versionOf('record', rec('r', 'p', { at: 222, updatedAt: 333 }))).toBe(333)
  })
  it('新的覆盖旧的，时间相同时删除优先', () => {
    expect(remoteWins({ updatedAt: 1, deleted: false })).toBe(true)
    expect(remoteWins({ updatedAt: 5, deleted: false }, { at: 4, deleted: false })).toBe(true)
    expect(remoteWins({ updatedAt: 4, deleted: false }, { at: 4, deleted: false })).toBe(false)
    expect(remoteWins({ updatedAt: 3, deleted: true }, { at: 4, deleted: false })).toBe(false)
    expect(remoteWins({ updatedAt: 4, deleted: true }, { at: 4, deleted: false })).toBe(true)
    expect(remoteWins({ updatedAt: 4, deleted: false }, { at: 4, deleted: true })).toBe(false)
  })
})

describe('应用更新时升级数据库', () => {
  const v1 = () => openDB('reptile-keeper', 1, { upgrade(db) { db.createObjectStore('pets', { keyPath: 'id' }); db.createObjectStore('records', { keyPath: 'id' }).createIndex('petId', 'petId') } })

  it('另一个窗口还开着旧版本时会提示，对方关闭后自动继续', async () => {
    vi.resetModules()
    globalThis.indexedDB = new IDBFactory() as unknown as typeof indexedDB
    const oldTab = await v1()
    await oldTab.put('pets', pet('p1'))
    const db = await import('./db')
    const blocked = vi.fn()
    db.onUpgradeBlocked(blocked)
    const loading = db.getAll()
    await vi.waitFor(() => expect(blocked).toHaveBeenCalled())
    expect(await Promise.race([loading, new Promise(r => setTimeout(r, 50, '还在等'))])).toBe('还在等')
    oldTab.close()
    expect(ids((await loading).pets)).toEqual(['p1'])
    const late = vi.fn()
    db.onUpgradeBlocked(late) // 之后才开始监听的也能得知
    expect(late).toHaveBeenCalled()
  })

  it('以后有更新的版本要升级时，本页主动让路', async () => {
    const a = await device()
    await a.putPet(pet('p1'))
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })
    const newer = await openDB('reptile-keeper', 3) // 不让路的话这里会一直等
    expect(reload).toHaveBeenCalled()
    expect(await newer.count('pets')).toBe(1)
    newer.close()
    vi.unstubAllGlobals()
  })
})

describe('本地改动与同步', () => {
  it('保存时写入修改时间并记为待上传；上传途中又改过的留到下一轮', async () => {
    const a = await device()
    at(5000)
    await a.putPet(pet('p1'))
    expect((await a.getPet('p1'))?.updatedAt).toBe(5000)
    const batch = await a.nextPendingBatch()
    expect(batch).toEqual([{ kind: 'pet', id: 'p1', updatedAt: 5000, deleted: false, data: { ...pet('p1'), updatedAt: 5000 } }])
    at(6000)
    await a.putPet(pet('p1', { name: '改名' }))
    await a.clearPending(batch)
    expect(await a.pendingCount()).toBe(1)
    await a.clearPending(await a.nextPendingBatch())
    expect(await a.pendingCount()).toBe(0)
  })

  it('改动传到另一台设备，对方不会再传回来', async () => {
    const { a, b } = await pair()
    const got = await b.getAll()
    expect(got.pets).toEqual([{ ...pet('p1'), updatedAt: 3000 }])
    expect(got.records).toEqual([{ ...rec('r1', 'p1'), updatedAt: 3000 }])
    expect(await b.pendingCount()).toBe(0)
    expect(await a.pendingCount()).toBe(0)
  })

  it('删除会传到另一台设备，重复收到不再生效', async () => {
    const { a, b } = await pair()
    at(7000)
    await a.deleteRecord('r1')
    const { batch, applied } = await send(a, b)
    expect(batch).toEqual([{ kind: 'record', id: 'r1', updatedAt: 7000, deleted: true }])
    expect(applied).toBe(1)
    expect((await b.getAll()).records).toEqual([])
    expect(await b.applyRemote(batch)).toBe(0)
    expect(await b.pendingCount()).toBe(0)
  })

  it('两台设备改了同一条：不管谁先到，后改的那次为准', async () => {
    const { a, b } = await pair()
    at(8000)
    await a.putRecord(rec('r1', 'p1', { note: 'A 改的' }))
    at(9000)
    await b.putRecord(rec('r1', 'p1', { note: 'B 改的' }))
    expect((await send(a, b)).applied).toBe(0)
    expect((await send(b, a)).applied).toBe(1)
    for (const d of [a, b]) expect((await d.getAll()).records[0].note).toBe('B 改的')
  })

  it('删除之后在别处又被修改：后发生的那次为准', async () => {
    const { a, b } = await pair()
    at(8000)
    await a.deleteRecord('r1')
    at(9000)
    await b.putRecord(rec('r1', 'p1', { note: '还在用' }))
    await send(a, b)
    await send(b, a)
    for (const d of [a, b]) expect((await d.getAll()).records.map(r => r.note)).toEqual(['还在用'])
  })

  it('旧版本升级后数据保留，且同步时算作旧内容', async () => {
    const a = await device()
    at(5000)
    await a.putRecordAndPet(rec('r1', 'p1', { note: '新' }), pet('p1'))
    await a.clearPending(await a.nextPendingBatch())
    const b = await device(async () => {
      const old = await openDB('reptile-keeper', 1, { upgrade(db) { db.createObjectStore('pets', { keyPath: 'id' }); db.createObjectStore('records', { keyPath: 'id' }).createIndex('petId', 'petId') } })
      await old.put('pets', pet('p1'))
      await old.put('records', rec('r1', 'p1', { note: '旧' }))
      await old.put('records', rec('r2', 'p1'))
      old.close()
    })
    expect(ids((await b.getAll()).records)).toEqual(['r1', 'r2'])
    await b.markAllPending()
    const { batch, applied } = await send(b, a)
    expect(batch.map(c => [c.id, c.updatedAt])).toEqual([['p1', 1000], ['r1', 2000], ['r2', 2000]])
    expect(applied).toBe(1) // 只有 a 没有的 r2
    await a.markAllPending()
    await send(a, b)
    for (const d of [a, b]) expect((await d.getAll()).records.find(r => r.id === 'r1')?.note).toBe('新')
  })

  it('对方时钟偏快也不会让本机之后的修改丢失', async () => {
    const a = await device()
    const b = await device()
    await b.applyRemote([{ kind: 'record', id: 'r1', updatedAt: 50_000, deleted: false, data: rec('r1', 'p1') }])
    at(10_000)
    await b.putRecord(rec('r1', 'p1', { note: '本机后改的' }))
    await a.applyRemote([{ kind: 'record', id: 'r1', updatedAt: 50_000, deleted: false, data: rec('r1', 'p1') }])
    expect((await send(b, a)).batch[0].updatedAt).toBe(50_001)
    expect((await a.getAll()).records[0].note).toBe('本机后改的')
    await b.deleteRecord('r1')
    expect((await b.nextPendingBatch())[0]).toMatchObject({ deleted: true, updatedAt: 50_002 })
  })

  it('删除宠物连同记录一起删，包括另一台设备期间新加的记录', async () => {
    const { a, b } = await pair()
    at(19_000)
    await b.putRecord(rec('r2', 'p1'))
    at(20_000)
    await a.deletePet('p1')
    await send(a, b)
    expect(await b.getAll()).toEqual({ pets: [], records: [] })
    const back = await send(b, a)
    expect(back.batch).toEqual([{ kind: 'record', id: 'r2', updatedAt: 20_000, deleted: true }])
    expect(await a.getAll()).toEqual({ pets: [], records: [] })
    expect(await a.pendingCount() + await b.pendingCount()).toBe(0)
  })

  it('覆盖导入：备份里没有的在其他设备上也删除；合并导入：全部上传', async () => {
    const { a, b } = await pair()
    at(25_000)
    await a.putPet(pet('p2'))
    await send(a, b)
    at(30_000)
    await a.importBackup({ pets: [pet('p1', { name: '备份里的' })], records: [] }, true)
    const { batch } = await send(a, b)
    expect(batch.map(c => [c.kind, c.id, c.deleted])).toEqual([['pet', 'p1', false], ['pet', 'p2', true], ['record', 'r1', true]])
    expect(await b.getAll()).toEqual({ pets: [{ ...pet('p1', { name: '备份里的' }), updatedAt: 30_000 }], records: [] })
    at(31_000)
    await b.importBackup({ pets: [pet('p2')], records: [rec('r9', 'p2')] }, false)
    await send(b, a)
    expect(ids((await a.getAll()).pets)).toEqual(['p1', 'p2'])
    expect(ids((await a.getAll()).records)).toEqual(['r9'])
  })

  it('首次开启同步时，已有内容和删除记录全部重新上传', async () => {
    const a = await device()
    at(4000)
    await a.putRecordAndPet(rec('r1', 'p1'), pet('p1'))
    await a.deleteRecord('r1')
    await a.clearPending(await a.nextPendingBatch())
    expect(await a.pendingCount()).toBe(0)
    await a.markAllPending()
    expect((await a.nextPendingBatch()).map(c => [c.id, c.deleted])).toEqual([['p1', false], ['r1', true]])
  })

  it('带照片的记录按大小和条数分批上传', async () => {
    const a = await device()
    await a.putRecords(Array.from({ length: 5 }, (_, i) => rec(`r${i}`, 'p1', { photo: 'x'.repeat(1000) })))
    expect(await a.nextPendingBatch(2500)).toHaveLength(2)
    expect(await a.nextPendingBatch(100)).toHaveLength(1) // 单条超限也要能传
    expect(await a.nextPendingBatch(1e9, 3)).toHaveLength(3)
    expect(await a.nextPendingBatch()).toHaveLength(5)
  })
})
