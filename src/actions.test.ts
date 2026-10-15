import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LogRecord, Pet } from './types'

let db: typeof import('./db')
let actions: typeof import('./actions')
const since = new Date('2026-10-16T09:00:00').getTime()
const pet = (): Pet => ({ id: 'p', name: 'GBB', species: 'spider', breed: 'GBB', sex: 'unknown', acquiredAt: '2026-01-01', notes: '', createdAt: 1, premoltSince: since })
const molt = (at: number): LogRecord => ({ id: 'm', petId: 'p', type: 'molt', at, note: '' })

beforeEach(async () => {
  vi.resetModules()
  globalThis.indexedDB = new IDBFactory()
  db = await import('./db')
  actions = await import('./actions')
  await db.putPet(pet())
})

describe('蜕皮记录与当前前期', () => {
  it('补录上月蜕皮保留当前前期，且不把当前前期天数写给历史记录', async () => {
    await actions.saveMolt(pet(), { ...molt(since - 30 * 86400000), premoltDays: 0 })
    expect((await db.getPet('p'))?.premoltSince).toBe(since)
    expect((await db.getAll()).records[0].premoltDays).toBeUndefined()
  })
  it('同一天但早于标记的蜕皮也不结束当前前期', async () => {
    await actions.saveMolt(pet(), molt(since - 1))
    expect((await db.getPet('p'))?.premoltSince).toBe(since)
  })
  it.each([0, 2 * 86400000])('本次前期开始后（相差 %i ms）才结束前期', async offset => {
    await actions.saveMolt(pet(), molt(since + offset))
    expect((await db.getPet('p'))?.premoltSince).toBeUndefined()
    expect((await db.getAll()).records[0].premoltDays).toBe(offset / 86400000)
  })
  it('保存读取数据库的最新标记，不用表单打开时的旧宠物资料', async () => {
    await db.putPet({ ...pet(), name: '新名字', premoltSince: since + 86400000 })
    await actions.saveMolt(pet(), molt(since))
    expect(await db.getPet('p')).toMatchObject({ name: '新名字', premoltSince: since + 86400000 })
  })
  it('历史记录保存失败时不会先清除前期', async () => {
    await expect(actions.saveMolt(pet(), { ...molt(since), id: undefined! })).rejects.toThrow()
    expect((await db.getPet('p'))?.premoltSince).toBe(since)
  })
  it('撤销历史蜕皮不恢复或覆盖保存后新标记的前期', async () => {
    const saved = await actions.saveMolt(pet(), molt(since - 86400000))
    await db.putPet({ ...pet(), premoltSince: since + 86400000 })
    await saved.undo()
    expect((await db.getPet('p'))?.premoltSince).toBe(since + 86400000)
    expect((await db.getAll()).records).toHaveLength(0)
  })
  it('撤销本次蜕皮恢复原标记，同时保留其他资料修改', async () => {
    const saved = await actions.saveMolt(pet(), molt(since + 86400000))
    const current = (await db.getPet('p'))!
    await db.putPet({ ...current, name: '新名字' })
    await saved.undo()
    expect(await db.getPet('p')).toMatchObject({ name: '新名字', premoltSince: since })
  })
  it('撤销本次蜕皮不会覆盖后来新标记的前期', async () => {
    const saved = await actions.saveMolt(pet(), molt(since))
    await db.putPet({ ...pet(), premoltSince: since + 86400000 })
    await saved.undo()
    expect((await db.getPet('p'))?.premoltSince).toBe(since + 86400000)
  })
  it('没有前期时正常保存蜕皮', async () => {
    await db.putPet({ ...pet(), premoltSince: undefined })
    const saved = await actions.saveMolt(pet(), molt(since))
    expect(saved.record.premoltDays).toBeUndefined()
    await saved.undo()
    expect((await db.getPet('p'))?.premoltSince).toBeUndefined()
  })
  it('已经记录了后续蜕皮，撤销较早记录不重新打开前期', async () => {
    const saved = await actions.saveMolt(pet(), molt(since))
    await db.putRecord({ ...molt(since + 86400000), id: 'later' })
    await saved.undo()
    expect((await db.getPet('p'))?.premoltSince).toBeUndefined()
    expect((await db.getAll()).records.map(r => r.id)).toEqual(['later'])
  })
  it('归档后撤销蜕皮不恢复前期', async () => {
    const saved = await actions.saveMolt(pet(), molt(since))
    const current = (await db.getPet('p'))!
    await db.putPet({ ...current, archivedAt: '2026-10-16' })
    await saved.undo()
    expect((await db.getPet('p'))?.premoltSince).toBeUndefined()
  })
})
