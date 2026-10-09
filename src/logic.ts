import type { LogRecord, Pet } from './types'

const DAY = 86400000
export const daysSince = (t?: number) => (t == null ? null : Math.floor((Date.now() - t) / DAY))

export function fmtDays(d: number | null) {
  if (d == null) return '无记录'
  if (d <= 0) return '今天'
  return `${d} 天前`
}

export const fmtTime = (t: number) =>
  new Date(t).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

export function petStatus(pet: Pet, records: LogRecord[]) {
  const rs = records.filter(r => r.petId === pet.id).sort((a, b) => b.at - a.at)
  const lastFeed = rs.find(r => r.type === 'feed')
  const lastEaten = rs.find(r => r.type === 'feed' && r.feedResult !== 'refused')
  const lastPoop = rs.find(r => r.type === 'poop')
  const lastMolt = rs.find(r => r.type === 'molt')
  const feedDays = daysSince(lastFeed?.at)
  const warnings: string[] = []

  const due = feedDays == null || feedDays >= pet.feedInterval
  if (due) warnings.push(feedDays == null ? '还没有喂食记录' : `该喂了（间隔 ${pet.feedInterval} 天）`)

  // 连续拒食：最近的喂食记录（蜕皮之后）全部为拒食
  let refusals = 0
  for (const r of rs) {
    if (r.type === 'molt') break
    if (r.type !== 'feed') continue
    if (r.feedResult === 'refused') refusals++
    else break
  }
  if (refusals >= 2) {
    warnings.push(pet.species === 'snake' ? `连续拒食 ${refusals} 次，注意是否临近蜕皮或环境异常` : `连续拒食 ${refusals} 次，可能进入蜕皮前期，请勿强喂并移除活饵`)
  }

  // 蛇进食后长时间未排便
  if (pet.species === 'snake' && lastEaten && (!lastPoop || lastPoop.at < lastEaten.at)) {
    const d = daysSince(lastEaten.at)!
    if (d >= 14) warnings.push(`进食后已 ${d} 天未排便，注意温度与饮水`)
  }
  const lastAbnormalPoop = rs.find(r => r.type === 'poop')
  if (lastAbnormalPoop && lastAbnormalPoop.poopNormal === false) warnings.push('最近一次排便异常')

  return { rs, lastFeed, lastPoop, lastMolt, feedDays, poopDays: daysSince(lastPoop?.at), due, warnings }
}

export function toLocalInput(t: number) {
  const d = new Date(t - new Date(t).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}
