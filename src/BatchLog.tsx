import { useState } from 'react'
import type { Ctx } from './App'
import { deleteRecords, putRecords, uid } from './db'
import { NextFeed } from './Home'
import { petStatus, recentFoods, type PetStatus } from './logic'
import NumInput from './NumInput'
import { FEED_RESULTS, SPECIES, type FeedResult, type LogRecord, type Pet } from './types'

type Mode = 'feed' | 'clean'
type Group = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'paused'
const GROUPS: Record<Group, string> = { overdue: '已逾期', today: '今天', tomorrow: '明天', week: '7 天内', later: '之后', paused: '暂停中（蜕皮前期 / 硬化期 / 适应期等）' }
const BATCH_RESULTS: FeedResult[] = ['eaten', 'refused', 'partial']
interface Row { checked: boolean; food: string; quantity?: number; result: FeedResult }

function groupOf(s: PetStatus): Group {
  if (s.pause || s.dueIn == null) return 'paused'
  if (s.dueIn < 0) return 'overdue'
  if (s.dueIn === 0) return 'today'
  if (s.dueIn === 1) return 'tomorrow'
  return s.dueIn <= 7 ? 'week' : 'later'
}

export default function BatchLog({ pets, records, reload, go, toast }: Ctx) {
  const items = pets.filter(p => !p.archivedAt).map(p => ({ p, s: petStatus(p, records) }))
  const [mode, setMode] = useState<Mode>('feed')
  const [rows, setRows] = useState<Record<string, Row>>(() => Object.fromEntries(items.map(({ p, s }) => {
    const last = recentFoods(p.id, records, 1)[0]
    const g = groupOf(s)
    return [p.id, { checked: g === 'overdue' || g === 'today', food: last?.food ?? SPECIES[p.species].foods[0], quantity: last?.quantity ?? 1, result: 'eaten' }]
  })))
  const [saving, setSaving] = useState(false)
  const update = (id: string, patch: Partial<Row>) => setRows(o => ({ ...o, [id]: { ...o[id], ...patch } }))
  const grouped = (Object.keys(GROUPS) as Group[])
    .map(g => ({ g, list: items.filter(x => groupOf(x.s) === g) }))
    .filter(x => x.list.length)
  const selected = items.filter(({ p }) => rows[p.id]?.checked)

  function toggleGroup(list: { p: Pet }[]) {
    const all = list.every(({ p }) => rows[p.id].checked)
    setRows(o => ({ ...o, ...Object.fromEntries(list.map(({ p }) => [p.id, { ...o[p.id], checked: !all }])) }))
  }

  async function save() {
    if (!selected.length) return
    const paused = selected.filter(({ s }) => s.pause)
    if (mode === 'feed' && paused.length && !confirm(`其中 ${paused.length} 只处于暂停期（${paused.map(({ p }) => p.name).join('、')}），确定一起记录喂食？`)) return
    setSaving(true)
    const at = Date.now()
    const rs: LogRecord[] = selected.map(({ p }) => {
      const row = rows[p.id]
      if (mode === 'clean') return { id: uid(), petId: p.id, type: 'clean', at, note: '' }
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
    toast({ text: `已为 ${rs.length} 只记录${mode === 'feed' ? '喂食' : '换水/清洁'}`, undo: async () => { await deleteRecords(rs.map(r => r.id)); await reload() } })
    go({ name: 'home' })
  }

  if (!items.length) return <p className="empty">还没有在养的宠物</p>

  return (
    <div className="batch">
      <div className="seg">
        <button className={mode === 'feed' ? 'on' : ''} onClick={() => setMode('feed')}>🍽️ 喂食</button>
        <button className={mode === 'clean' ? 'on' : ''} onClick={() => setMode('clean')}>💧 换水/清洁</button>
      </div>
      <p className="muted small">勾选要记录的宠物，时间记为现在。{mode === 'feed' && '食物默认沿用每只上一次的喂食。'}</p>
      {grouped.map(({ g, list }) => (
        <section key={g} className="panel">
          <div className="row">
            <h3 className="grow">{GROUPS[g]}（{list.length}）</h3>
            <button className="ghost sm-btn" onClick={() => toggleGroup(list)}>{list.every(({ p }) => rows[p.id].checked) ? '全不选' : '全选'}</button>
          </div>
          {list.map(({ p, s }) => {
            const row = rows[p.id]
            return (
              <div key={p.id} className={`batch-row ${row.checked ? 'on' : ''}`}>
                <label className="check">
                  <input type="checkbox" checked={row.checked} onChange={e => update(p.id, { checked: e.target.checked })} />
                  <span className="grow"><b>{SPECIES[p.species].emoji} {p.name}</b> <span className="muted small"><NextFeed s={s} /></span></span>
                </label>
                {row.checked && mode === 'feed' && (
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
      ))}
      {(Object.keys(SPECIES) as (keyof typeof SPECIES)[]).map(k => (
        <datalist key={k} id={`foods-${k}`}>{SPECIES[k].foods.map(f => <option key={f} value={f} />)}</datalist>
      ))}
      <button className="primary sticky-save" disabled={!selected.length || saving} onClick={save}>
        保存（{selected.length} 只）
      </button>
    </div>
  )
}
