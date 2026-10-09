import { SPECIES, STAGES, type LogRecord, type Pet, type Stage } from './types'

export const DAY = 86400000
const HOUR = 3600000

export const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }
// 按本地自然日计算天数差：昨晚 8 点到今早算 1 天
export const dayDiff = (from: number, to: number) => Math.round((startOfDay(to) - startOfDay(from)) / DAY)
export const addDays = (t: number, n: number) => { const d = new Date(startOfDay(t)); d.setDate(d.getDate() + n); return d.getTime() }
export const daysSince = (t: number | undefined, now = Date.now()) => (t == null ? null : dayDiff(t, now))
export const parseDate = (d: string) => new Date(d + 'T00:00:00').getTime()

export function fmtDays(d: number | null) {
  if (d == null) return '无记录'
  if (d <= 0) return '今天'
  return `${d} 天前`
}

export const fmtTime = (t: number) =>
  new Date(t).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
export const fmtMD = (t: number) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}` }
const fmtMDHM = (t: number) => { const d = new Date(t); return `${fmtMD(t)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 下次喂食日的相对描述
export function fmtDue(dueIn: number, nextDue: number) {
  if (dueIn < 0) return `已逾期 ${-dueIn} 天`
  if (dueIn === 0) return '今天'
  if (dueIn === 1) return '明天'
  return `${dueIn < 7 ? WEEKDAYS[new Date(nextDue).getDay()] : fmtMD(nextDue)}（${dueIn} 天后）`
}

export function toLocalInput(t: number) {
  const d = new Date(t - new Date(t).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

export function fmtAge(days: number) {
  if (days < 0) return '—'
  if (days < 60) return `${days} 天`
  const months = Math.floor(days / 30.44)
  if (months < 24) return `${months} 个月`
  const y = Math.floor(months / 12), m = months % 12
  return m ? `${y} 岁 ${m} 个月` : `${y} 岁`
}

export const isEaten = (r: LogRecord) => r.type === 'feed' && r.feedResult !== 'refused' && r.feedResult !== 'regurgitated'

// 年龄、龄期、成长阶段
export function petGrowth(pet: Pet, records: LogRecord[], now = Date.now()) {
  const sp = SPECIES[pet.species]
  const arthropod = pet.species !== 'snake'
  const molts = records.filter(r => r.petId === pet.id && r.type === 'molt').sort((a, b) => a.at - b.at)
  const acquired = parseDate(pet.acquiredAt)
  const moltsSince = molts.filter(r => r.at >= acquired).length
  const totalMolts = (pet.initialMolts ?? 0) + moltsSince
  // 最近一次蜕皮记录手动填了龄期则以它为准
  const lastWithInstar = [...molts].reverse().find(r => r.instar)
  const instar = arthropod ? (lastWithInstar?.instar ?? totalMolts + 1) : undefined
  const keptDays = dayDiff(acquired, now)

  let ageDays: number | null = null
  let estimated = false
  if (pet.hatchDate) ageDays = dayDiff(parseDate(pet.hatchDate), now)
  else if (arthropod && pet.initialMolts != null) {
    // 入手前的年龄按平均蜕皮间隔估算
    ageDays = keptDays + pet.initialMolts * sp.moltDays
    estimated = true
  } else if (!arthropod && pet.initialAgeMonths != null) {
    ageDays = keptDays + Math.ceil(pet.initialAgeMonths * 30.44)
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
  return { ageDays, estimated, instar, totalMolts, stage, keptDays }
}

// 当前阶段的喂食间隔；阶段未知（如蛇没填年龄）时按成体间隔
export function feedInterval(pet: Pet, stage: Stage | undefined) {
  const st = stage ?? 'adult'
  const days = pet.feedIntervals?.[st] ?? SPECIES[pet.species].intervals[st]
  return { days, stage: st, label: stage ? `${STAGES[st]}期` : '阶段未知，按成体' }
}

export const hardenDaysFor = (pet: Pet, stage: Stage | undefined) =>
  pet.species === 'snake' ? 0 : pet.hardenDays ?? SPECIES[pet.species].harden[stage ?? 'nymph']
export const acclimDaysFor = (pet: Pet) => pet.acclimDays ?? SPECIES[pet.species].acclimDays

export interface MoltEntry { id: string; at: number; instar?: number; gapDays: number | null; complete?: boolean; premoltDays: number | null }

// 蜕皮历史（时间正序），前期天数优先用手动标记算出的值，否则按蜕皮前连续拒食推算
export function moltHistory(pet: Pet, records: LogRecord[]): MoltEntry[] {
  const rs = records.filter(r => r.petId === pet.id).sort((a, b) => a.at - b.at)
  const out: MoltEntry[] = []
  let prev: LogRecord | undefined
  rs.forEach((r, i) => {
    if (r.type !== 'molt') return
    let premoltDays = r.premoltDays ?? null
    if (premoltDays == null) {
      let earliest: LogRecord | undefined
      for (let j = i - 1; j >= 0 && rs[j].type !== 'molt'; j--) {
        if (rs[j].type !== 'feed') continue
        if (rs[j].feedResult === 'refused') earliest = rs[j]
        else break
      }
      if (earliest) premoltDays = dayDiff(earliest.at, r.at)
    }
    out.push({ id: r.id, at: r.at, instar: r.instar, gapDays: prev ? dayDiff(prev.at, r.at) : null, complete: r.moltComplete, premoltDays })
    prev = r
  })
  return out
}

export type ForecastState = 'before' | 'window' | 'late' | 'overdue'
export interface MoltForecast { start: number; end: number; reference: boolean; sinceDays: number; lastGap: number | null; state: ForecastState }

// 下次蜕皮预测窗口：节肢类（未成体）按上一龄间隔 1.0–1.5 倍，蛇按最近 3 次平均间隔 0.8–1.2 倍
export function moltForecast(pet: Pet, history: MoltEntry[], stage: Stage | undefined, now = Date.now()): MoltForecast | null {
  const last = history.at(-1)
  if (!last) return null
  const gaps = history.map(h => h.gapDays).filter((g): g is number => g != null && g > 0)
  const lastGap = gaps.at(-1) ?? null
  let lo: number, hi: number, reference = false
  if (pet.species !== 'snake') {
    // 成体节肢类：螳螂不再蜕皮，蜘蛛成体只看历史
    if (stage === 'adult') return null
    if (lastGap) { lo = lastGap; hi = lastGap * 1.5 }
    else { lo = SPECIES[pet.species].moltDays * 0.8; hi = SPECIES[pet.species].moltDays * 1.5; reference = true }
  } else {
    if (!gaps.length) return null
    const recent = gaps.slice(-3)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    lo = avg * 0.8; hi = avg * 1.2
  }
  lo = Math.round(lo); hi = Math.round(hi)
  const sinceDays = dayDiff(last.at, now)
  const state: ForecastState = sinceDays < lo ? 'before' : sinceDays <= hi ? 'window' : sinceDays > hi * 1.5 ? 'overdue' : 'late'
  return { start: addDays(last.at, lo), end: addDays(last.at, hi), reference, sinceDays, lastGap, state }
}

export type Level = 'info' | 'warn' | 'danger'
export interface Alert {
  code: string
  level: Level
  text: string
  action?: { kind: 'markPremolt'; label: string; since: number } | { kind: 'preyRemoved'; label: string }
}
export type PauseKind = 'premolt' | 'hardening' | 'regurg' | 'acclim'
export interface Pause { kind: PauseKind; since: number; until?: number; label: string }

export function petStatus(pet: Pet, records: LogRecord[], now = Date.now()) {
  const rs = records.filter(r => r.petId === pet.id).sort((a, b) => b.at - a.at)
  const sp = SPECIES[pet.species]
  const arthropod = pet.species !== 'snake'
  const g = petGrowth(pet, rs, now)
  const feeds = rs.filter(r => r.type === 'feed')
  const lastFeed = feeds[0]
  const lastEaten = feeds.find(isEaten)
  const lastPoop = rs.find(r => r.type === 'poop')
  const lastMolt = rs.find(r => r.type === 'molt')
  const interval = feedInterval(pet, g.stage)
  const history = moltHistory(pet, rs)
  const forecast = moltForecast(pet, history, g.stage, now)
  const today = startOfDay(now)
  const acquired = parseDate(pet.acquiredAt)
  const base = {
    rs, g, interval, history, forecast, lastFeed, lastEaten, lastPoop, lastMolt,
    feedDays: daysSince(lastFeed?.at, now), poopDays: daysSince(lastPoop?.at, now),
  }
  if (pet.archivedAt) return { ...base, nextDue: null, dueIn: null, due: false, pause: undefined, alerts: [] as Alert[] }

  // —— 喂食到期引擎 ——
  const hardenDays = hardenDaysFor(pet, g.stage)
  // 蜕皮后还没成功进食才算硬化期
  const hardenEnd = arthropod && lastMolt && hardenDays > 0 && (!lastEaten || lastMolt.at > lastEaten.at)
    ? addDays(lastMolt.at, hardenDays) : null
  const regurgs = feeds.filter(r => r.feedResult === 'regurgitated')
  let regurgEnd: number | null = null
  if (regurgs.length) {
    const t = regurgs[0].regurgAt ?? regurgs[0].at
    const repeat = regurgs.slice(1).some(r => dayDiff(r.regurgAt ?? r.at, t) <= 30)
    if (!feeds.some(f => f.at > t && isEaten(f))) regurgEnd = addDays(t, repeat ? 21 : 14)
  }
  const acclimDays = acclimDaysFor(pet)
  const acclimEnd = !lastFeed ? addDays(acquired, acclimDays) : null
  const start = lastFeed ? addDays(lastFeed.at, interval.days) : acclimEnd!
  let nextDue: number | null = Math.max(start, hardenEnd ?? 0, regurgEnd ?? 0)

  const premoltName = sp.premoltName
  let pause: Pause | undefined
  if (pet.premoltSince) {
    const stopped = lastEaten ? dayDiff(lastEaten.at, now) : null
    const lastPremolt = [...history].reverse().find(h => h.premoltDays != null)?.premoltDays
    pause = {
      kind: 'premolt', since: pet.premoltSince,
      label: `${premoltName}第 ${dayDiff(pet.premoltSince, now) + 1} 天` + (stopped != null ? ` · 已停食 ${stopped} 天` : '') + (lastPremolt != null ? `（上次约 ${lastPremolt} 天）` : ''),
    }
    nextDue = null
  } else if (hardenEnd && today < hardenEnd) {
    pause = { kind: 'hardening', since: lastMolt!.at, until: hardenEnd, label: `硬化期第 ${dayDiff(lastMolt!.at, now) + 1} 天 · 约 ${dayDiff(now, hardenEnd)} 天后可喂` }
  } else if (regurgEnd && today < regurgEnd) {
    pause = { kind: 'regurg', since: regurgs[0].regurgAt ?? regurgs[0].at, until: regurgEnd, label: `吐食后休整至 ${fmtMD(regurgEnd)} · 下次换小一号猎物` }
  } else if (acclimEnd && today < acclimEnd) {
    pause = { kind: 'acclim', since: acquired, until: acclimEnd, label: `适应期第 ${dayDiff(acquired, now) + 1}/${acclimDays} 天 · 勿上手` }
  }
  const dueIn = nextDue == null ? null : dayDiff(now, nextDue)
  const due = !pause && dueIn != null && dueIn <= 0

  // —— 提醒 ——
  const alerts: Alert[] = []
  if (due) alerts.push({ code: 'due', level: 'warn', text: lastFeed ? `该喂了（${interval.label}每 ${interval.days} 天）` : '还没有喂食记录，可以尝试首次投喂' })

  // 连续拒食（蜕皮后重新计数）；处于暂停期时不提示
  const streak: LogRecord[] = []
  for (const r of rs) {
    if (r.type === 'molt') break
    if (r.type !== 'feed') continue
    if (r.feedResult === 'refused') streak.push(r)
    else break
  }
  if (streak.length >= 2 && !pause) {
    const restDays = hardenDays + (pet.species === 'mantis' ? 4 : 21)
    if (arthropod && lastMolt && dayDiff(lastMolt.at, now) <= restDays) {
      alerts.push({ code: 'postmolt-refuse', level: 'info', text: `连续拒食 ${streak.length} 次：蜕皮后休整期拒食较常见，及时取出活饵` })
    } else {
      alerts.push({
        code: 'refuse', level: 'warn',
        text: arthropod ? `连续拒食 ${streak.length} 次，可能进入蜕皮前期：请勿强喂，及时取出活饵` : `连续拒食 ${streak.length} 次，注意是否临近蜕皮（蓝眼期）或环境异常`,
        action: { kind: 'markPremolt', label: `标记为${premoltName}`, since: streak.at(-1)!.at },
      })
    }
  }

  if (pet.premoltSince && pet.species !== 'spider' && dayDiff(pet.premoltSince, now) > 21) {
    alerts.push({ code: 'premolt-long', level: 'warn', text: pet.species === 'snake' ? '蓝眼期已超过 21 天：检查湿度，或是否漏记了蜕皮' : '蜕皮前期已超过 21 天，检查温湿度' })
  }

  // 剩饵未取出
  const pending = feeds.filter(r => r.preyLeft && !r.preyRemovedAt)
  if (pending.length) {
    const hours = Math.max(0, Math.floor((now - Math.min(...pending.map(r => r.at))) / HOUR))
    const molting = pause?.kind === 'premolt' || pause?.kind === 'hardening'
    alerts.push({
      code: 'prey', level: hours >= 24 || molting ? 'danger' : hours >= 12 ? 'warn' : 'info',
      text: `待取出剩饵 · 已 ${hours} 小时` + (molting ? '（蜕皮期间活饵可能咬伤宠物）' : ''),
      action: { kind: 'preyRemoved', label: '已取出' },
    })
  }

  if (!arthropod) {
    if (lastEaten && now - lastEaten.at < 72 * HOUR) {
      alerts.push({ code: 'digest', level: 'info', text: `消化中，勿上手（至 ${fmtMDHM(lastEaten.at + 72 * HOUR)}）` })
    }
    const recentRegurg = regurgs.filter(r => dayDiff(r.regurgAt ?? r.at, now) <= 60)
    if (recentRegurg.length >= 2) alerts.push({ code: 'regurg-repeat', level: 'danger', text: `60 天内吐食 ${recentRegurg.length} 次，建议咨询爬宠兽医` })
    if (!feeds.some(isEaten) && feeds.some(r => r.feedResult === 'refused') && g.keptDays >= 14) {
      alerts.push({ code: 'not-started', level: 'warn', text: `到家 ${g.keptDays} 天仍未开食，建议咨询有经验的饲主或兽医` })
    }
    // 进食后长时间未排便
    if (lastEaten && (!lastPoop || lastPoop.at < lastEaten.at)) {
      const d = dayDiff(lastEaten.at, now)
      if (d >= 14) alerts.push({ code: 'no-poop', level: 'warn', text: `进食后已 ${d} 天未排便，注意温度与饮水` })
    }
  }
  if (lastPoop && lastPoop.poopNormal === false) alerts.push({ code: 'poop-abnormal', level: 'warn', text: '最近一次排便异常' })

  if (forecast && !pet.premoltSince) {
    if (forecast.state === 'window') alerts.push({ code: 'molt-soon', level: 'info', text: `可能临近蜕皮（预计 ${fmtMD(forecast.start)}–${fmtMD(forecast.end)}${forecast.reference ? '，参考值' : ''}）` })
    else if (forecast.state === 'overdue') alerts.push({ code: 'molt-late', level: 'info', text: `距上次蜕皮 ${forecast.sinceDays} 天，超出以往间隔，留意温度和喂食量` })
  }

  return { ...base, nextDue, dueIn, due, pause, alerts }
}

export type PetStatus = ReturnType<typeof petStatus>

// 这只宠物最近用过的食物（去重），用于默认值和快捷按钮
export function recentFoods(petId: string, records: LogRecord[], n = 3) {
  const seen = new Set<string>()
  const out: { food: string; quantity?: number }[] = []
  for (const r of records.filter(r => r.petId === petId && r.type === 'feed' && r.food).sort((a, b) => b.at - a.at)) {
    const key = `${r.food}×${r.quantity ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ food: r.food!, quantity: r.quantity })
    if (out.length >= n) break
  }
  return out
}

// 首次进食（开食）：入手后的第一条已吃记录
export function firstMeal(pet: Pet, records: LogRecord[]) {
  const acquired = parseDate(pet.acquiredAt)
  const first = records.filter(r => r.petId === pet.id && isEaten(r) && r.at >= acquired).sort((a, b) => a.at - b.at)[0]
  return first ? { at: first.at, day: dayDiff(acquired, first.at) + 1 } : null
}
