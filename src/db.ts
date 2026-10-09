import { openDB, type DBSchema } from 'idb'
import type { LogRecord, Pet } from './types'

interface Schema extends DBSchema {
  pets: { key: string; value: Pet }
  records: { key: string; value: LogRecord; indexes: { petId: string } }
}

const dbp = openDB<Schema>('reptile-keeper', 1, {
  upgrade(db) {
    db.createObjectStore('pets', { keyPath: 'id' })
    db.createObjectStore('records', { keyPath: 'id' }).createIndex('petId', 'petId')
  },
})

export const uid = () => crypto.randomUUID()

export async function getAll() {
  const db = await dbp
  const [pets, records] = await Promise.all([db.getAll('pets'), db.getAll('records')])
  return { pets, records }
}
export const putPet = async (p: Pet) => (await dbp).put('pets', p)
export const putRecord = async (r: LogRecord) => (await dbp).put('records', r)
export const deleteRecord = async (id: string) => (await dbp).delete('records', id)

export async function deletePet(id: string) {
  const db = await dbp
  const tx = db.transaction(['pets', 'records'], 'readwrite')
  await tx.objectStore('pets').delete(id)
  const idx = tx.objectStore('records').index('petId')
  for (let c = await idx.openCursor(id); c; c = await c.continue()) await c.delete()
  await tx.done
}

export interface Backup { version: 1; exportedAt: string; pets: Pet[]; records: LogRecord[] }

export async function importBackup(b: Backup, replace: boolean) {
  if (!Array.isArray(b?.pets) || !Array.isArray(b?.records)) throw new Error('备份文件格式不正确')
  const db = await dbp
  const tx = db.transaction(['pets', 'records'], 'readwrite')
  if (replace) await Promise.all([tx.objectStore('pets').clear(), tx.objectStore('records').clear()])
  for (const p of b.pets) await tx.objectStore('pets').put(p)
  for (const r of b.records) await tx.objectStore('records').put(r)
  await tx.done
}
