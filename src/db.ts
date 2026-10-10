import { openDB, type DBSchema, type IDBPTransaction } from 'idb'
import { localDate } from './logic'
import { RECORD_TYPES, SPECIES, type LogRecord, type Pet } from './types'

export type Kind = 'pet' | 'record'
// 同步时在设备和服务器之间传递的一条改动；deleted 为 true 时没有 data
export interface Change { kind: Kind; id: string; updatedAt: number; deleted: boolean; data?: Pet | LogRecord }
interface Tomb { key: string; kind: Kind; id: string; deletedAt: number }
interface Version { at: number; deleted: boolean }

interface Schema extends DBSchema {
  pets: { key: string; value: Pet }
  records: { key: string; value: LogRecord; indexes: { petId: string } }
  tombstones: { key: string; value: Tomb } // 已删除项留下的“墓碑”，同步时让其他设备也删除
  pending: { key: string; value: { key: string } } // 还没上传到服务器的项，键为“类型:id”
}

const STORES = ['pets', 'records', 'tombstones', 'pending'] as const
type Tx = IDBPTransaction<Schema, typeof STORES, 'readwrite'>

// 升级数据库结构时，如果另一个标签页或窗口还开着旧版本，浏览器会一直等它关闭。此时通知界面提示用户
let upgradeBlocked = false
let onBlocked: (() => void) | undefined
export const onUpgradeBlocked = (f?: () => void) => { onBlocked = f; if (upgradeBlocked) f?.() }

// 首次使用时才打开数据库，方便在 Node 中单元测试本文件的纯函数
let conn: ReturnType<typeof openDB<Schema>> | undefined
const open = () => conn ??= openDB<Schema>('reptile-keeper', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('pets', { keyPath: 'id' })
      db.createObjectStore('records', { keyPath: 'id' }).createIndex('petId', 'petId')
    }
    if (oldVersion < 2) {
      db.createObjectStore('tombstones', { keyPath: 'key' })
      db.createObjectStore('pending', { keyPath: 'key' })
    }
  },
  blocked() {
    upgradeBlocked = true
    onBlocked?.()
  },
  // 反过来：以后有更新的版本要升级时，本页主动让路，并刷新到新版本
  blocking() {
    conn?.then(db => db.close())
    globalThis.location?.reload()
  },
})

export const uid = () => crypto.randomUUID()

const keyOf = (kind: Kind, id: string) => `${kind}:${id}`
const splitKey = (key: string) => { const i = key.indexOf(':'); return [key.slice(0, i) as Kind, key.slice(i + 1)] as const }
// pets 和 records 两个表按类型取用时类型不同，统一成只用到的几个方法
interface ItemStore { get(id: string): Promise<Pet | LogRecord | undefined>; put(v: Pet | LogRecord): Promise<unknown>; delete(id: string): Promise<void> }
const itemStore = (tx: Tx, kind: Kind) => tx.objectStore(kind === 'pet' ? 'pets' : 'records') as unknown as ItemStore

// 修改时间。旧版数据没有 updatedAt，按创建时间算，这样之后的任何修改都比它新
export const versionOf = (kind: Kind, x: Pet | LogRecord) => x.updatedAt ?? (kind === 'pet' ? (x as Pet).createdAt : (x as LogRecord).at) ?? 0
// 服务器发来的改动是否比本地的新（时间相同时删除优先，与服务器的规则一致）
export const remoteWins = (c: { updatedAt: number; deleted: boolean }, local?: Version) =>
  !local || c.updatedAt > local.at || (c.updatedAt === local.at && c.deleted && !local.deleted)

async function currentVersion(tx: Tx, kind: Kind, id: string): Promise<Version | undefined> {
  const item = await itemStore(tx, kind).get(id)
  if (item) return { at: versionOf(kind, item), deleted: false }
  const tomb = await tx.objectStore('tombstones').get(keyOf(kind, id))
  return tomb && { at: tomb.deletedAt, deleted: true }
}
// 本次改动的时间：一定晚于被它替换的内容，本机时钟偏慢时改动也不会在同步中被当成旧的
const stamp = async (tx: Tx, kind: Kind, id: string, now: number) => Math.max(now, ((await currentVersion(tx, kind, id))?.at ?? -1) + 1)

async function put(tx: Tx, kind: Kind, item: Pet | LogRecord, now: number) {
  const key = keyOf(kind, item.id)
  const updatedAt = await stamp(tx, kind, item.id, now)
  await Promise.all([itemStore(tx, kind).put({ ...item, updatedAt }), tx.objectStore('tombstones').delete(key), tx.objectStore('pending').put({ key })])
}
async function del(tx: Tx, kind: Kind, id: string, now: number) {
  const key = keyOf(kind, id)
  const deletedAt = await stamp(tx, kind, id, now)
  await Promise.all([itemStore(tx, kind).delete(id), tx.objectStore('tombstones').put({ key, kind, id, deletedAt }), tx.objectStore('pending').put({ key })])
}
const recordIdsOf = (tx: Tx, petId: string) => tx.objectStore('records').index('petId').getAllKeys(petId)

// 所有本地改动都经过这里：在一个事务里写入、盖上修改时间、记下待上传，完成后通知同步
let onLocalChange: (() => void) | undefined
export const setLocalChangeListener = (f?: () => void) => { onLocalChange = f }
async function write(fn: (tx: Tx, now: number) => Promise<void>) {
  const tx = (await open()).transaction(STORES, 'readwrite')
  await Promise.all([fn(tx, Date.now()), tx.done])
  onLocalChange?.()
}

export async function getAll() {
  const db = await open()
  const [pets, records] = await Promise.all([db.getAll('pets'), db.getAll('records')])
  return { pets, records }
}
export const getPet = async (id: string) => (await open()).get('pets', id)
export const putPet = (p: Pet) => write((tx, now) => put(tx, 'pet', p, now))
export const putRecord = (r: LogRecord) => write((tx, now) => put(tx, 'record', r, now))
export const deleteRecord = (id: string) => write((tx, now) => del(tx, 'record', id, now))
export const putRecords = (rs: LogRecord[]) => write(async (tx, now) => { for (const r of rs) await put(tx, 'record', r, now) })
export const deleteRecords = (ids: string[]) => write(async (tx, now) => { for (const id of ids) await del(tx, 'record', id, now) })
// 在同一事务中写入记录和宠物（例如记录蜕皮同时结束蜕皮前期）
export const putRecordAndPet = (r: LogRecord, p: Pet) => write(async (tx, now) => { await put(tx, 'record', r, now); await put(tx, 'pet', p, now) })
// 删除宠物及其全部记录
export const deletePet = (id: string) => write(async (tx, now) => {
  for (const rid of await recordIdsOf(tx, id)) await del(tx, 'record', rid, now)
  await del(tx, 'pet', id, now)
})

export interface Backup { version: 1; exportedAt: string; pets: Pet[]; records: LogRecord[] }

export const makeBackup = (pets: Pet[], records: LogRecord[]): Backup => ({ version: 1, exportedAt: new Date().toISOString(), pets, records })

// 校验备份内容，丢弃无法识别的宠物和记录，并补齐必需字段
export function validateBackup(raw: unknown, existingPetIds: string[] = []) {
  const b = raw as Partial<Backup> | null
  if (!b || !Array.isArray(b.pets) || !Array.isArray(b.records)) throw new Error('备份文件格式不正确')
  const today = localDate()
  const pets: Pet[] = b.pets
    .filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && Object.hasOwn(SPECIES, p.species))
    .map(p => ({ ...p, breed: p.breed ?? '', sex: p.sex ?? 'unknown', notes: p.notes ?? '', createdAt: p.createdAt ?? Date.now(), acquiredAt: typeof p.acquiredAt === 'string' && p.acquiredAt ? p.acquiredAt : today }))
  const petIds = new Set([...pets.map(p => p.id), ...existingPetIds])
  const records: LogRecord[] = b.records
    .filter(r => r && typeof r.id === 'string' && typeof r.petId === 'string' && petIds.has(r.petId) && Object.hasOwn(RECORD_TYPES, r.type) && typeof r.at === 'number' && Number.isFinite(r.at))
    .map(r => ({ ...r, note: r.note ?? '' }))
  return { pets, records, skipped: b.pets.length - pets.length + b.records.length - records.length }
}

// 导入的内容按“刚刚修改”处理；覆盖时备份里没有的宠物和记录逐条删除，开着同步的话其他设备也会跟着删
export const importBackup = (b: { pets: Pet[]; records: LogRecord[] }, replace: boolean) => write(async (tx, now) => {
  if (replace) {
    const pets = new Set(b.pets.map(p => p.id)), records = new Set(b.records.map(r => r.id))
    for (const id of await tx.objectStore('pets').getAllKeys()) if (!pets.has(id)) await del(tx, 'pet', id, now)
    for (const id of await tx.objectStore('records').getAllKeys()) if (!records.has(id)) await del(tx, 'record', id, now)
  }
  for (const p of b.pets) await put(tx, 'pet', p, now)
  for (const r of b.records) await put(tx, 'record', r, now)
})

// —— 以下供同步（sync.ts）使用 ——

export const pendingCount = async () => (await open()).count('pending')

// 首次开启同步，或服务器的数据库换过时：本地已有的内容和删除记录全部重新上传一遍
export async function markAllPending() {
  const tx = (await open()).transaction(STORES, 'readwrite')
  const [pets, records, tombs] = await Promise.all([tx.objectStore('pets').getAllKeys(), tx.objectStore('records').getAllKeys(), tx.objectStore('tombstones').getAllKeys()])
  const keys = [...pets.map(id => keyOf('pet', id)), ...records.map(id => keyOf('record', id)), ...tombs]
  await Promise.all([...keys.map(key => tx.objectStore('pending').put({ key })), tx.done])
}

// 取一批待上传的改动（内容以此刻本地的为准）。带照片的记录较大，按大小和条数分批
export async function nextPendingBatch(maxBytes = 3_000_000, maxItems = 200) {
  const db = await open()
  const out: Change[] = []
  let size = 0
  for (const key of await db.getAllKeys('pending')) {
    const [kind, id] = splitKey(key)
    const item = await db.get(kind === 'pet' ? 'pets' : 'records', id)
    const tomb = item ? undefined : await db.get('tombstones', key)
    if (!item && !tomb) { await db.delete('pending', key); continue }
    const bytes = item ? JSON.stringify(item).length : 100
    if (out.length && (out.length >= maxItems || size + bytes > maxBytes)) break
    out.push(item ? { kind, id, updatedAt: versionOf(kind, item), deleted: false, data: item } : { kind, id, updatedAt: tomb!.deletedAt, deleted: true })
    size += bytes
  }
  return out
}

// 上传成功后清掉待上传标记；上传期间又被改过的保留到下一轮
export async function clearPending(sent: Change[]) {
  const tx = (await open()).transaction(STORES, 'readwrite')
  for (const c of sent) {
    const cur = await currentVersion(tx, c.kind, c.id)
    if (!cur || (cur.at === c.updatedAt && cur.deleted === c.deleted)) await tx.objectStore('pending').delete(keyOf(c.kind, c.id))
  }
  await tx.done
}

// 把服务器发来的改动合并进本地，返回实际生效的条数。不算“本地改动”，不会触发再次上传
export async function applyRemote(changes: Change[]) {
  const tx = (await open()).transaction(STORES, 'readwrite')
  let applied = 0
  for (const c of changes) {
    const key = keyOf(c.kind, c.id)
    const cur = await currentVersion(tx, c.kind, c.id)
    if (cur && cur.at === c.updatedAt && cur.deleted === c.deleted) { await tx.objectStore('pending').delete(key); continue } // 服务器上已是同一版本
    if (!remoteWins(c, cur) || (!c.deleted && c.data?.id !== c.id)) continue
    if (c.deleted) {
      await itemStore(tx, c.kind).delete(c.id)
      await tx.objectStore('tombstones').put({ key, kind: c.kind, id: c.id, deletedAt: c.updatedAt })
      // 宠物在别的设备上被删除：本机还挂在它名下的记录一并删除，这些删除也会上传
      if (c.kind === 'pet') for (const rid of await recordIdsOf(tx, c.id)) await del(tx, 'record', rid, c.updatedAt)
    } else {
      await itemStore(tx, c.kind).put({ ...c.data!, updatedAt: c.updatedAt })
      await tx.objectStore('tombstones').delete(key)
    }
    await tx.objectStore('pending').delete(key)
    applied++
  }
  await tx.done
  return applied
}
