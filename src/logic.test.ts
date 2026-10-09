import { describe, expect, it } from 'vitest'
import { validateBackup } from './db'
import { addDays, dayDiff, fmtDue, moltHistory, petStatus, recentFoods } from './logic'
import type { LogRecord, Pet } from './types'

// 固定“现在”：2026-10-09 10:00（本地时间）
const NOW = new Date(2026, 9, 9, 10, 0).getTime()
const at = (daysAgo: number, hour = 10) => new Date(2026, 9, 9 - daysAgo, hour, 0).getTime()
const date = (daysAgo: number) => { const d = new Date(2026, 9, 9 - daysAgo); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

const pet = (p: Partial<Pet> = {}): Pet => ({
  id: 'p1', name: '测试', species: 'spider', breed: '', sex: 'unknown', acquiredAt: date(200), notes: '', createdAt: at(200), ...p,
})
let n = 0
const rec = (r: Partial<LogRecord> & Pick<LogRecord, 'type' | 'at'>): LogRecord => ({ id: `r${n++}`, petId: 'p1', note: '', ...r })
const feed = (daysAgo: number, feedResult: LogRecord['feedResult'] = 'eaten', extra: Partial<LogRecord> = {}) =>
  rec({ type: 'feed', at: at(daysAgo), feedResult, food: '蟋蟀', quantity: 1, ...extra })
const molt = (daysAgo: number, extra: Partial<LogRecord> = {}) => rec({ type: 'molt', at: at(daysAgo), moltComplete: true, ...extra })
const codes = (s: ReturnType<typeof petStatus>) => s.alerts.map(a => a.code)

describe('自然日计算', () => {
  it('昨晚 8 点到今早 10 点算 1 天', () => {
    expect(dayDiff(at(1, 20), NOW)).toBe(1)
    expect(dayDiff(at(0, 1), NOW)).toBe(0)
  })
  it('fmtDue 描述', () => {
    expect(fmtDue(-3, addDays(NOW, -3))).toBe('已逾期 3 天')
    expect(fmtDue(0, NOW)).toBe('今天')
    expect(fmtDue(1, addDays(NOW, 1))).toBe('明天')
    expect(fmtDue(2, addDays(NOW, 2))).toMatch(/^周.（2 天后）$/)
  })
})

describe('喂食到期', () => {
  it('按阶段间隔计算下次喂食日（蜘蛛幼体 4 天）', () => {
    const s = petStatus(pet({ initialMolts: 2 }), [feed(3)], NOW)
    expect(s.dueIn).toBe(1)
    expect(s.due).toBe(false)
    const s2 = petStatus(pet({ initialMolts: 2 }), [feed(5)], NOW)
    expect(s2.dueIn).toBe(-1)
    expect(codes(s2)).toContain('due')
  })

  it('蜕皮后硬化期内不提醒喂食，结束当天即可喂', () => {
    const p = pet({ initialMolts: 2 }) // 蜕皮后 L4，仍为幼体，硬化 5 天
    const s = petStatus(p, [feed(20), molt(2)], NOW)
    expect(s.pause?.kind).toBe('hardening')
    expect(s.due).toBe(false)
    expect(codes(s)).not.toContain('due')
    const s2 = petStatus(p, [feed(20), molt(5)], NOW)
    expect(s2.pause).toBeUndefined()
    expect(s2.dueIn).toBe(0)
  })

  it('蜕皮后成功进食即结束硬化期', () => {
    const s = petStatus(pet({ initialMolts: 2 }), [molt(3), feed(1)], NOW)
    expect(s.pause).toBeUndefined()
  })

  it('个体硬化期覆盖默认值', () => {
    const s = petStatus(pet({ initialMolts: 2, hardenDays: 1 }), [feed(20), molt(2)], NOW)
    expect(s.pause).toBeUndefined()
  })

  it('到家适应期内不提示“还没有喂食记录”', () => {
    const s = petStatus(pet({ species: 'snake', acquiredAt: date(3) }), [], NOW)
    expect(s.pause?.kind).toBe('acclim')
    expect(codes(s)).not.toContain('due')
    const s2 = petStatus(pet({ species: 'snake', acquiredAt: date(8) }), [], NOW)
    expect(s2.pause).toBeUndefined()
    expect(codes(s2)).toContain('due')
  })

  it('手动标记蜕皮前期：不计逾期，显示停食天数', () => {
    const s = petStatus(pet({ premoltSince: at(5) }), [feed(30)], NOW)
    expect(s.pause?.kind).toBe('premolt')
    expect(s.nextDue).toBeNull()
    expect(s.due).toBe(false)
    expect(s.pause?.label).toContain('第 6 天')
    expect(s.pause?.label).toContain('已停食 30 天')
  })

  it('蛇蓝眼期超过 21 天提示检查', () => {
    const s = petStatus(pet({ species: 'snake', premoltSince: at(25) }), [feed(40)], NOW)
    expect(codes(s)).toContain('premolt-long')
    // 蜘蛛不设上限
    expect(codes(petStatus(pet({ premoltSince: at(90) }), [feed(100)], NOW))).not.toContain('premolt-long')
  })

  it('已归档：无提醒、无下次喂食', () => {
    const s = petStatus(pet({ archivedAt: date(1) }), [feed(100)], NOW)
    expect(s.alerts).toEqual([])
    expect(s.nextDue).toBeNull()
  })
})

describe('拒食', () => {
  it('连续拒食 2 次提示蜕皮前期，并可一键标记（从第一次拒食算起）', () => {
    const s = petStatus(pet(), [feed(30), feed(10, 'refused'), feed(3, 'refused')], NOW)
    const a = s.alerts.find(x => x.code === 'refuse')!
    expect(a.level).toBe('warn')
    expect(a.action).toMatchObject({ kind: 'markPremolt', since: at(10) })
  })
  it('蜕皮后休整期内的拒食只是提示信息', () => {
    const s = petStatus(pet({ initialMolts: 2 }), [molt(15), feed(8, 'refused'), feed(2, 'refused')], NOW)
    expect(codes(s)).toContain('postmolt-refuse')
    expect(codes(s)).not.toContain('refuse')
  })
})

describe('剩饵', () => {
  it('按时长分级，蜕皮期间直接升为危险', () => {
    const fresh = rec({ type: 'feed', at: NOW - 2 * 3600000, feedResult: 'refused', preyLeft: true })
    expect(petStatus(pet(), [feed(20), fresh], NOW).alerts.find(a => a.code === 'prey')?.level).toBe('info')
    const old = rec({ type: 'feed', at: NOW - 30 * 3600000, feedResult: 'refused', preyLeft: true })
    expect(petStatus(pet(), [old], NOW).alerts.find(a => a.code === 'prey')?.level).toBe('danger')
    expect(petStatus(pet({ premoltSince: at(3) }), [fresh], NOW).alerts.find(a => a.code === 'prey')?.level).toBe('danger')
  })
  it('取出后不再提醒', () => {
    const r = rec({ type: 'feed', at: at(1), feedResult: 'refused', preyLeft: true, preyRemovedAt: at(0) })
    expect(codes(petStatus(pet(), [r], NOW))).not.toContain('prey')
  })
})

describe('蛇吐食与消化', () => {
  const snake = pet({ species: 'snake', initialAgeMonths: 30 })
  it('吐食后休整 14 天，且吐食不算进食', () => {
    const s = petStatus(snake, [feed(5, 'regurgitated', { regurgAt: at(4) })], NOW)
    expect(s.pause?.kind).toBe('regurg')
    expect(s.lastEaten).toBeUndefined()
    expect(dayDiff(NOW, s.nextDue!)).toBe(10)
  })
  it('30 天内再次吐食休整 21 天；60 天内 2 次提示就医', () => {
    const s = petStatus(snake, [feed(30, 'regurgitated'), feed(3, 'regurgitated')], NOW)
    expect(dayDiff(NOW, s.nextDue!)).toBe(18)
    expect(s.alerts.find(a => a.code === 'regurg-repeat')?.level).toBe('danger')
  })
  it('进食 72 小时内提示勿上手', () => {
    expect(codes(petStatus(snake, [feed(1)], NOW))).toContain('digest')
    expect(codes(petStatus(snake, [feed(4)], NOW))).not.toContain('digest')
  })
  it('到家 14 天仍未开食', () => {
    const s = petStatus(pet({ species: 'snake', acquiredAt: date(15) }), [feed(8, 'refused'), feed(1, 'refused')], NOW)
    expect(codes(s)).toContain('not-started')
  })
})

describe('蜕皮历史与预测', () => {
  it('计算间隔，并由蜕皮前的连续拒食推算前期天数', () => {
    const p = pet({ initialMolts: 2 })
    const h = moltHistory(p, [molt(60), feed(50), feed(40, 'refused'), feed(35, 'refused'), molt(30)])
    expect(h.map(x => x.gapDays)).toEqual([null, 30])
    expect(h[1].premoltDays).toBe(10)
  })
  it('节肢类按上一龄间隔给出窗口，进入窗口时提示', () => {
    const s = petStatus(pet({ initialMolts: 2 }), [molt(90), molt(50), feed(20)], NOW)
    expect(s.forecast?.lastGap).toBe(40)
    expect(s.forecast?.state).toBe('window') // 50 天在 40–60 之间
    expect(codes(s)).toContain('molt-soon')
  })
  it('无历史间隔时按物种参考值，并标注参考', () => {
    const s = petStatus(pet({ initialMolts: 2 }), [molt(10), feed(2)], NOW)
    expect(s.forecast?.reference).toBe(true)
    expect(s.forecast?.state).toBe('before')
  })
  it('成年螳螂不预测', () => {
    expect(petStatus(pet({ species: 'mantis', initialMolts: 7 }), [molt(10)], NOW).forecast).toBeNull()
  })
  it('蛇需要至少一个间隔才预测', () => {
    const snake = pet({ species: 'snake' })
    expect(petStatus(snake, [molt(10)], NOW).forecast).toBeNull()
    expect(petStatus(snake, [molt(75), molt(35)], NOW).forecast?.state).toBe('window') // 间隔 40，窗口 32–48，已 35 天
  })
})

describe('其他', () => {
  it('最近食物去重', () => {
    const rs = [feed(3, 'eaten', { food: '杜比亚', quantity: 2 }), feed(2, 'eaten', { food: '蟋蟀', quantity: 1 }), feed(1, 'eaten', { food: '杜比亚', quantity: 2 })]
    expect(recentFoods('p1', rs)).toEqual([{ food: '杜比亚', quantity: 2 }, { food: '蟋蟀', quantity: 1 }])
  })
  it('备份校验跳过无法识别的条目', () => {
    const v = validateBackup({
      pets: [pet(), { id: 'x', name: 'bad', species: 'cat' }],
      records: [feed(1), { id: 'y', petId: 'x', type: 'feed', at: 1 }, { id: 'z', petId: 'p1', type: 'weird', at: 1 }],
    })
    expect(v.pets).toHaveLength(1)
    expect(v.records).toHaveLength(1)
    expect(v.skipped).toBe(3)
  })
  it('备份格式错误时报错', () => {
    expect(() => validateBackup({ foo: 1 })).toThrow()
  })
})
