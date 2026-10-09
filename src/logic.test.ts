import { describe, expect, it } from 'vitest'
import { validateBackup } from './db'
import { addDays, dayDiff, firstMeal, fmtDue, localDate, moltHistory, newMoltRecord, petStatus, recentFoods } from './logic'
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

describe('复查发现的问题（回归测试）', () => {
  it('A：成年螳螂连续拒食不提示蜕皮前期，也没有标记按钮', () => {
    const s = petStatus(pet({ species: 'mantis', initialMolts: 7 }), [feed(10), feed(6, 'refused'), feed(2, 'refused')], NOW)
    const a = s.alerts.find(x => x.code === 'refuse')!
    expect(a.text).not.toContain('蜕皮前期')
    expect(a.action).toBeUndefined()
  })
  it('B：localDate 使用本地日期', () => {
    expect(localDate(new Date(2026, 9, 9, 7, 0).getTime())).toBe('2026-10-09')
    expect(localDate(new Date(2026, 0, 2, 0, 5).getTime())).toBe('2026-01-02')
  })
  it('C：入手日期无效时退回建档时间，不产生 NaN', () => {
    const s = petStatus(pet({ acquiredAt: '', createdAt: at(30) }), [], NOW)
    expect(Number.isNaN(s.dueIn)).toBe(false)
    expect(s.due).toBe(true)
  })
  it('D：入手前的喂食记录不结束适应期', () => {
    const s = petStatus(pet({ species: 'snake', acquiredAt: date(2) }), [feed(10)], NOW)
    expect(s.pause?.kind).toBe('acclim')
  })
  it('E：适应期内拒食不结束适应期，也不提示蜕皮前期', () => {
    const s = petStatus(pet({ species: 'snake', acquiredAt: date(4) }), [feed(3, 'refused'), feed(1, 'refused')], NOW)
    expect(s.pause?.kind).toBe('acclim')
    expect(s.due).toBe(false)
    expect(s.alerts.map(a => a.code)).not.toContain('refuse')
  })
  it('E：适应期结束后按最后一次尝试计算下次喂食', () => {
    const s = petStatus(pet({ species: 'snake', acquiredAt: date(10) }), [feed(3, 'refused')], NOW)
    expect(s.pause).toBeUndefined()
    expect(s.dueIn).toBe(11) // 阶段未知按成体 14 天：3 天前尝试 + 14 天
  })
  it('F：蛇吃下后吐出算开过食，不提示未开食', () => {
    const p = pet({ species: 'snake', acquiredAt: date(20) })
    const rs = [feed(15, 'regurgitated'), feed(5, 'refused')]
    expect(petStatus(p, rs, NOW).alerts.map(a => a.code)).not.toContain('not-started')
    expect(firstMeal(p, rs)?.day).toBe(6)
  })
  it('L：addDays 总是返回当天 0 点', () => {
    const t = addDays(NOW, 3)
    expect(new Date(t).getHours()).toBe(0)
    expect(dayDiff(NOW, t)).toBe(3)
  })
})

describe('加水/喷雾', () => {
  it('按物种默认：蜘蛛每 7 天加水、不提醒喷雾；螳螂每 2 天喷雾、不提醒加水', () => {
    const spider = petStatus(pet(), [rec({ type: 'water', at: at(8) })], NOW)
    expect(spider.care.water).toMatchObject({ every: 7, days: 8, due: true })
    expect(spider.care.mist.every).toBe(0)
    const a = spider.alerts.find(x => x.code === 'water')!
    expect(a.level).toBe('info')
    expect(a.action).toMatchObject({ kind: 'logCare', type: 'water' })
    const mantis = petStatus(pet({ species: 'mantis' }), [rec({ type: 'mist', at: at(1) })], NOW)
    expect(mantis.care.mist).toMatchObject({ every: 2, due: false })
    expect(mantis.care.water.every).toBe(0)
  })
  it('个体设置覆盖默认，0 为关闭', () => {
    const s = petStatus(pet({ waterInterval: 0, mistInterval: 3 }), [], NOW)
    expect(s.care.water.due).toBe(false)
    expect(s.care.mist).toMatchObject({ every: 3, due: true }) // 入手 200 天且从未喷雾
    expect(s.alerts.find(x => x.code === 'mist')?.text).toContain('还没有喷雾记录')
  })
  it('刚入手、未到间隔时不提醒', () => {
    expect(petStatus(pet({ acquiredAt: date(2) }), [], NOW).care.water.due).toBe(false)
  })
  it('蜕皮历史统计蜕皮前 7 天的喷雾和加水次数', () => {
    const h = moltHistory(pet(), [rec({ type: 'mist', at: at(12) }), rec({ type: 'mist', at: at(8) }), rec({ type: 'mist', at: at(6) }), rec({ type: 'water', at: at(5) }), molt(4, { moltComplete: false })])
    expect(h[0]).toMatchObject({ mist7: 2, water7: 1 })
  })
})

describe('加水/喷雾（复查回归）', () => {
  it('已归档的宠物不显示加水/喷雾到期', () => {
    const s = petStatus(pet({ archivedAt: date(1) }), [rec({ type: 'water', at: at(30) })], NOW)
    expect(s.care.water.due).toBe(false)
    expect(s.care.water.days).toBe(30)
  })
})

describe('一键记录蜕皮', () => {
  it('节肢类龄期自动 +1，并记下蜕皮前期天数', () => {
    const p = pet({ initialMolts: 3, premoltSince: at(12) }) // 当前 L4
    const r = newMoltRecord(p, [], 'm1', NOW)
    expect(r).toMatchObject({ type: 'molt', instar: 5, moltComplete: true, premoltDays: 12 })
  })
  it('以最近一次填写的龄期为准继续 +1', () => {
    const r = newMoltRecord(pet({ initialMolts: 1 }), [molt(30, { instar: 6 })], 'm2', NOW)
    expect(r.instar).toBe(7)
    expect(r.premoltDays).toBeUndefined()
  })
  it('蛇不记龄期，蜕皮次数随记录自动增加', () => {
    const snake = pet({ species: 'snake', initialMolts: 5 })
    const r = newMoltRecord(snake, [], 'm3', NOW)
    expect(r.instar).toBeUndefined()
    expect(petStatus(snake, [r], NOW).g.totalMolts).toBe(6)
  })
})
