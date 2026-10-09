import { SPECIES, STAGES, type LogRecord, type Pet, type Stage } from './types'

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

  const interval = feedInterval(pet, petGrowth(pet, records).stage)
  const due = feedDays == null || feedDays >= interval.days
  if (due) warnings.push(feedDays == null ? '还没有喂食记录' : `该喂了（${interval.label}每 ${interval.days} 天）`)

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

  return { rs, interval, lastFeed, lastPoop, lastMolt, feedDays, poopDays: daysSince(lastPoop?.at), due, warnings }
}

export function toLocalInput(t: number) {
  const d = new Date(t - new Date(t).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

const parseDate = (d: string) => new Date(d + 'T00:00:00').getTime()

export function fmtAge(days: number) {
  if (days < 0) return '—'
  if (days < 60) return `${days} 天`
  const months = Math.floor(days / 30.44)
  if (months < 24) return `${months} 个月`
  const y = Math.floor(months / 12), m = months % 12
  return m ? `${y} 岁 ${m} 个月` : `${y} 岁`
}

// 年龄、龄期、成长阶段
export function petGrowth(pet: Pet, records: LogRecord[]) {
  const sp = SPECIES[pet.species]
  const arthropod = pet.species !== 'snake'
  const molts = records.filter(r => r.petId === pet.id && r.type === 'molt').sort((a, b) => a.at - b.at)
  const acquired = parseDate(pet.acquiredAt)
  const moltsSince = molts.filter(r => r.at >= acquired).length
  const totalMolts = (pet.initialMolts ?? 0) + moltsSince
  // 最近一次蜕皮记录手动填了龄期则以它为准
  const lastWithInstar = [...molts].reverse().find(r => r.instar)
  const instar = arthropod ? (lastWithInstar?.instar ?? totalMolts + 1) : undefined

  let ageDays: number | null = null
  let estimated = false
  if (pet.hatchDate) ageDays = Math.floor((Date.now() - parseDate(pet.hatchDate)) / 864e5)
  else if (arthropod && pet.initialMolts != null) {
    // 入手前的年龄按平均蜕皮间隔估算
    ageDays = Math.floor((Date.now() - acquired) / 864e5) + pet.initialMolts * sp.moltDays
    estimated = true
  } else if (!arthropod && pet.initialAgeMonths != null) {
    ageDays = Math.floor((Date.now() - acquired) / 864e5) + Math.ceil(pet.initialAgeMonths * 30.44)
    estimated = true
  }

  let stage: Stage | undefined
  if (arthropod) {
    const adult = pet.adultInstar || sp.adultInstar
    stage = pet.stageOverride ?? (instar! >= adult ? 'adult' : instar! >= adult - 2 ? 'subadult' : 'nymph')
  } else {
    // 蛇按年龄判断：达到成体月龄为成体，过半为亚成
    const adultDays = (pet.adultMonths || sp.adultMonths) * 30.44
    stage = pet.stageOverride ?? (ageDays == null ? undefined : ageDays >= adultDays ? 'adult' : ageDays >= adultDays / 2 ? 'subadult' : 'nymph')
  }
  return { ageDays, estimated, instar, totalMolts, stage, keptDays: Math.floor((Date.now() - acquired) / 864e5) }
}

// 当前阶段的喂食间隔；阶段未知（如蛇没填年龄）时按成体间隔
export function feedInterval(pet: Pet, stage: Stage | undefined) {
  const st = stage ?? 'adult'
  const days = pet.feedIntervals?.[st] ?? SPECIES[pet.species].intervals[st]
  return { days, stage: st, label: stage ? `${STAGES[st]}期` : '阶段未知，按成体' }
}
