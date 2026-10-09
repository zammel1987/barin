import { openDB, type DBSchema } from 'idb'
import { localDate } from './logic'
import { RECORD_TYPES, SPECIES, type LogRecord, type Pet } from './types'

interface Schema extends DBSchema {
  pets: { key: string; value: Pet }
  records: { key: string; value: LogRecord; indexes: { petId: string } }
}

// 首次使用时才打开数据库，方便在 Node 中单元测试本文件的纯函数
let conn: ReturnType<typeof openDB<Schema>> | undefined
const open = () => conn ??= openDB<Schema>('reptile-keeper', 1, {
  upgrade(db) {
    db.createObjectStore('pets', { keyPath: 'id' })
    db.createObjectStore('records', { keyPath: 'id' }).createIndex('petId', 'petId')
  },
})

export const uid = () => crypto.randomUUID()

export async function getAll() {
  const db = await open()
  const [pets, records] = await Promise.all([db.getAll('pets'), db.getAll('records')])
  return { pets, records }
}
export const putPet = async (p: Pet) => (await open()).put('pets', p)
export const getPet = async (id: string) => (await open()).get('pets', id)
export const putRecord = async (r: LogRecord) => (await open()).put('records', r)
export const deleteRecord = async (id: string) => (await open()).delete('records', id)

// 批量写入/删除，各用一个事务
export async function putRecords(rs: LogRecord[]) {
  const tx = (await open()).transaction('records', 'readwrite')
  await Promise.all([...rs.map(r => tx.store.put(r)), tx.done])
}
export async function deleteRecords(ids: string[]) {
  const tx = (await open()).transaction('records', 'readwrite')
  await Promise.all([...ids.map(id => tx.store.delete(id)), tx.done])
}

// 在同一事务中写入记录和宠物（例如记录蜕皮同时结束蜕皮前期）
export async function putRecordAndPet(r: LogRecord, p: Pet) {
  const tx = (await open()).transaction(['records', 'pets'], 'readwrite')
  await Promise.all([tx.objectStore('records').put(r), tx.objectStore('pets').put(p), tx.done])
}

export async function deletePet(id: string) {
  const db = await open()
  const tx = db.transaction(['pets', 'records'], 'readwrite')
  await tx.objectStore('pets').delete(id)
  const idx = tx.objectStore('records').index('petId')
  for (let c = await idx.openCursor(id); c; c = await c.continue()) await c.delete()
  await tx.done
}

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

export async function importBackup(b: { pets: Pet[]; records: LogRecord[] }, replace: boolean) {
  const db = await open()
  const tx = db.transaction(['pets', 'records'], 'readwrite')
  if (replace) await Promise.all([tx.objectStore('pets').clear(), tx.objectStore('records').clear()])
  for (const p of b.pets) await tx.objectStore('pets').put(p)
  for (const r of b.records) await tx.objectStore('records').put(r)
  await tx.done
}
