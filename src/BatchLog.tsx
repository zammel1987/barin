import { useState } from 'react'
import type { Ctx } from './App'
import { deleteRecords, putRecords, uid } from './db'
import { NextFeed } from './Home'
import { fmtDays, petStatus, recentFoods, type CareType, type PetStatus } from './logic'
import NumInput from './NumInput'
import { FEED_RESULTS, RECORD_TYPES, SPECIES, type FeedResult, type LogRecord, type Pet } from './types'

type Mode = 'feed' | 'water' | 'mist' | 'clean'
const MODES: Mode[] = ['feed', 'water', 'mist', 'clean']
const FEED_GROUPS = { overdue: '已逾期', today: '今天', tomorrow: '明天', week: '7 天内', later: '之后', paused: '暂停中（蜕皮前期 / 硬化期 / 适应期等）' }
const CARE_GROUPS = { due: '已到期', ok: '未到期', off: '未开启提醒' }
const BATCH_RESULTS: FeedResult[] = ['eaten', 'refused', 'partial']
interface FeedRow { food: string; quantity?: number; result: FeedResult }

function feedGroup(s: PetStatus): keyof typeof FEED_GROUPS {
  if (s.pause || s.dueIn == null) return 'paused'
  if (s.dueIn < 0) return 'overdue'
  if (s.dueIn === 0) return 'today'
  if (s.dueIn === 1) return 'tomorrow'
  return s.dueIn <= 7 ? 'week' : 'later'
}
const careGroup = (s: PetStatus, t: CareType): keyof typeof CARE_GROUPS => (s.care[t].every <= 0 ? 'off' : s.care[t].due ? 'due' : 'ok')

// 每种模式的分组和默认勾选
function groupOf(mode: Mode, s: PetStatus): string {
  if (mode === 'feed') return feedGroup(s)
  if (mode === 'clean') return 'all'
  return careGroup(s, mode)
}
function defaultChecked(mode: Mode, s: PetStatus) {
  const g = groupOf(mode, s)
  return mode === 'feed' ? g === 'overdue' || g === 'today' : g === 'due'
}
const groupLabels = (mode: Mode): Record<string, string> => (mode === 'feed' ? FEED_GROUPS : mode === 'clean' ? { all: '全部' } : CARE_GROUPS)

function CareInfo({ s, t }: { s: PetStatus; t: CareType }) {
  const c = s.care[t]
  return <>上次 {fmtDays(c.days)}{c.every > 0 ? ` · 每 ${c.every} 天` : ''}</>
}

export default function BatchLog({ pets, records, reload, go, toast }: Ctx) {
  const items = pets.filter(p => !p.archivedAt).map(p => ({ p, s: petStatus(p, records) }))
  const [mode, setMode] = useState<Mode>('feed')
  // 勾选状态按模式分开保存；未操作过的用默认值
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const isChecked = (p: Pet, s: PetStatus) => checks[`${mode}:${p.id}`] ?? defaultChecked(mode, s)
  const setChecked = (ids: string[], v: boolean) => setChecks(o => ({ ...o, ...Object.fromEntries(ids.map(id => [`${mode}:${id}`, v])) }))
  // 喂食内容默认沿用每只上一次的食物
  const [edits, setEdits] = useState<Record<string, Partial<FeedRow>>>({})
  const feedRow = (p: Pet): FeedRow => {
    const last = recentFoods(p.id, records, 1)[0]
    return { food: last?.food ?? SPECIES[p.species].foods[0], quantity: last?.quantity ?? 1, result: 'eaten', ...edits[p.id] }
  }
  const update = (id: string, patch: Partial<FeedRow>) => setEdits(o => ({ ...o, [id]: { ...o[id], ...patch } }))
  const [saving, setSaving] = useState(false)

  const labels = groupLabels(mode)
  const grouped = Object.keys(labels)
    .map(g => ({ g, list: items.filter(x => groupOf(mode, x.s) === g) }))
    .filter(x => x.list.length)
  const selected = items.filter(({ p, s }) => isChecked(p, s))
  const what = mode === 'feed' ? '喂食' : RECORD_TYPES[mode].label

  async function save() {
    if (!selected.length) return
    const paused = selected.filter(({ s }) => s.pause)
    if (mode === 'feed' && paused.length && !confirm(`其中 ${paused.length} 只处于暂停期（${paused.map(({ p }) => p.name).join('、')}），确定一起记录喂食？`)) return
    setSaving(true)
    const at = Date.now()
    const rs: LogRecord[] = selected.map(({ p }) => {
      if (mode !== 'feed') return { id: uid(), petId: p.id, type: mode, at, note: '' }
      const row = feedRow(p)
      const leftover = row.result === 'refused' || row.result === 'partial'
      return {
        id: uid(), petId: p.id, type: 'feed', at, note: '',
        food: row.food.trim() || undefined, quantity: row.quantity, feedResult: row.result,
        // 节肢类拒食/吃剩默认提醒取出剩饵
        preyLeft: leftover && p.species !== 'snake' ? true : undefined,
      }
    })
    await putRecords(rs)
    await reload()
    toast({ text: `已为 ${rs.length} 只记录${what}`, undo: async () => { await deleteRecords(rs.map(r => r.id)); await reload() } })
    go({ name: 'home' })
  }

  if (!items.length) return <p className="empty">还没有在养的宠物</p>

  return (
    <div className="batch">
      <div className="seg">
        {MODES.map(m => (
          <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'feed' ? '🍽️ 喂食' : `${RECORD_TYPES[m].emoji} ${RECORD_TYPES[m].label}`}</button>
        ))}
      </div>
      <p className="muted small">勾选要记录的宠物，时间记为现在。{mode === 'feed' ? '食物默认沿用每只上一次的喂食。' : mode !== 'clean' ? '已到期的默认勾选，间隔可在宠物资料里修改。' : ''}</p>
      {grouped.map(({ g, list }) => {
        const all = list.every(({ p, s }) => isChecked(p, s))
        return (
          <section key={g} className="panel">
            <div className="row">
              <h3 className="grow">{labels[g]}（{list.length}）</h3>
              <button className="ghost sm-btn" onClick={() => setChecked(list.map(({ p }) => p.id), !all)}>{all ? '全不选' : '全选'}</button>
            </div>
            {list.map(({ p, s }) => {
              const checked = isChecked(p, s)
              const row = feedRow(p)
              return (
                <div key={p.id} className={`batch-row ${checked ? 'on' : ''}`}>
                  <label className="check">
                    <input type="checkbox" checked={checked} onChange={e => setChecked([p.id], e.target.checked)} />
                    <span className="grow"><b>{SPECIES[p.species].emoji} {p.name}</b> <span className="muted small">
                      {mode === 'feed' ? <NextFeed s={s} /> : mode === 'clean' ? null : <CareInfo s={s} t={mode} />}
                    </span></span>
                  </label>
                  {checked && mode === 'feed' && (
                    <div className="batch-fields">
                      <input list={`foods-${p.species}`} value={row.food} onChange={e => update(p.id, { food: e.target.value })} aria-label="食物" />
                      <NumInput value={row.quantity} onChange={v => update(p.id, { quantity: v })} placeholder="数量" />
                      <div className="seg small-seg">
                        {BATCH_RESULTS.map(k => (
                          <button type="button" key={k} className={row.result === k ? 'on' : ''} onClick={() => update(p.id, { result: k })}>{FEED_RESULTS[k]}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
      {(Object.keys(SPECIES) as (keyof typeof SPECIES)[]).map(k => (
        <datalist key={k} id={`foods-${k}`}>{SPECIES[k].foods.map(f => <option key={f} value={f} />)}</datalist>
      ))}
      <button className="primary sticky-save" disabled={!selected.length || saving} onClick={save}>
        保存{what}（{selected.length} 只）
      </button>
    </div>
  )
}
