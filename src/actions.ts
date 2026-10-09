import { putPet, putRecords } from './db'
import { dayDiff, petStatus } from './logic'
import type { LogRecord, Pet } from './types'

export const markPremolt = (pet: Pet, since = Date.now()) => putPet({ ...pet, premoltSince: since })
export const endPremolt = (pet: Pet) => putPet({ ...pet, premoltSince: undefined })

// 标记所有未取出的剩饵为已取出
export function markPreyRemoved(pet: Pet, records: LogRecord[]) {
  const now = Date.now()
  return putRecords(records.filter(r => r.petId === pet.id && r.preyLeft && !r.preyRemovedAt).map(r => ({ ...r, preyRemovedAt: now })))
}

// 处于硬化期或蜕皮前期时投喂前确认；返回 false 表示取消
export function confirmFeed(pet: Pet, records: LogRecord[]) {
  const { pause, lastMolt } = petStatus(pet, records)
  if (pause?.kind === 'hardening') {
    const day = dayDiff(lastMolt!.at, Date.now()) + 1
    return confirm(pet.species === 'spider' ? `蜕皮后第 ${day} 天，螯牙已经变黑了吗？确定投喂？` : '刚蜕皮不久（硬化期），确定投喂？')
  }
  if (pause?.kind === 'premolt') {
    return confirm(pet.species === 'snake' ? '处于蓝眼期，一般暂停喂食。确定投喂？' : '处于蜕皮前期，若不吃请 24 小时内取出活饵。确定投喂？')
  }
  return true
}
