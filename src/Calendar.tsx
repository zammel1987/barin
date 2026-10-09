import { useState } from 'react'
import type { Ctx } from './App'
import { RecordItem } from './PetDetail'
import RecordForm from './RecordForm'
import { RECORD_TYPES, type LogRecord } from './types'

const dayKey = (t: number | Date) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

export default function Calendar({ pets, records, reload, go }: Ctx) {
  const now = new Date()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected] = useState(dayKey(now))
  const [petId, setPetId] = useState('all')
  const [editing, setEditing] = useState<LogRecord | null>(null)

  const petName = new Map(pets.map(p => [p.id, p.name]))
  const byDay = new Map<string, LogRecord[]>()
  for (const r of records) {
    if (petId !== 'all' && r.petId !== petId) continue
    const k = dayKey(r.at)
    byDay.set(k, [...(byDay.get(k) ?? []), r])
  }

  const y = month.getFullYear(), m = month.getMonth()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7 // 周一开头
  const days = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))]
  const dayRecords = (byDay.get(selected) ?? []).sort((a, b) => b.at - a.at)
  const editPet = editing && pets.find(p => p.id === editing.petId)

  return (
    <>
      <div className="chips">
        <button className={petId === 'all' ? 'on' : ''} onClick={() => setPetId('all')}>全部</button>
        {pets.map(p => <button key={p.id} className={petId === p.id ? 'on' : ''} onClick={() => setPetId(p.id)}>{p.name}</button>)}
      </div>
      <section className="panel">
        <div className="row cal-head">
          <button className="icon" onClick={() => setMonth(new Date(y, m - 1, 1))} aria-label="上个月">‹</button>
          <b className="grow">{y} 年 {m + 1} 月</b>
          <button className="icon" onClick={() => setMonth(new Date(y, m + 1, 1))} aria-label="下个月">›</button>
        </div>
        <div className="cal">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="cal-wd">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const k = dayKey(d)
            const rs = byDay.get(k) ?? []
            const icons = [...new Set(rs.map(r => r.type))].slice(0, 3).map(t => RECORD_TYPES[t].emoji)
            return (
              <button key={i} className={`cal-day ${k === selected ? 'sel' : ''} ${k === dayKey(now) ? 'today' : ''}`} onClick={() => setSelected(k)}>
                <span>{d.getDate()}</span>
                <span className="cal-icons">{icons.join('')}</span>
              </button>
            )
          })}
        </div>
      </section>
      <section className="panel">
        <h3>{selected.split('-').map((v, i) => i === 1 ? Number(v) + 1 : v).join('/')} 的记录</h3>
        {dayRecords.length === 0 && <p className="empty">当天没有记录</p>}
        <ul className="timeline">
          {dayRecords.map(r => (
            <RecordItem key={r.id} r={r} title={petName.get(r.petId)} onOpen={() => setEditing(r)} />
          ))}
        </ul>
      </section>
      {pets.length === 0 && <button className="ghost" onClick={() => go({ name: 'petForm' })}>先添加宠物</button>}
      {editing && editPet && <RecordForm pet={editPet} records={records} type={editing.type} rec={editing} onClose={() => setEditing(null)} reload={reload} />}
    </>
  )
}
