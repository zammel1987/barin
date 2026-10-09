import { useState } from 'react'
import type { Ctx } from './App'
import { deleteRecord } from './db'
import { fmtAge, fmtDays, fmtTime, petGrowth, petStatus } from './logic'
import { FEED_RESULTS, RECORD_TYPES, SPECIES, STAGES, type LogRecord, type Pet, type RecordType } from './types'
import RecordForm from './RecordForm'
import QuickLog from './QuickLog'
import WeightChart from './WeightChart'

export function describe(r: LogRecord) {
  switch (r.type) {
    case 'feed': return [r.food, r.quantity ? `×${r.quantity}` : '', r.feedResult ? FEED_RESULTS[r.feedResult] : ''].filter(Boolean).join(' ')
    case 'poop': return r.poopNormal === false ? '异常' : '正常'
    case 'molt': return [r.instar ? `进入 L${r.instar}` : '', r.moltComplete === false ? '蜕皮不完整' : r.moltComplete ? '完整' : ''].filter(Boolean).join(' · ')
    case 'weight': return r.weight != null ? `${r.weight} g` : ''
    default: return ''
  }
}

export function RecordItem({ r, title, onOpen, onDelete }: { r: LogRecord; title?: string; onOpen: () => void; onDelete?: () => void }) {
  const [zoom, setZoom] = useState(false)
  return (
    <li onClick={onOpen}>
      <span className="t-icon">{RECORD_TYPES[r.type].emoji}</span>
      <div className="grow">
        <div>{title && <b>{title} · </b>}<b>{RECORD_TYPES[r.type].label}</b> <span className={r.feedResult === 'refused' || r.poopNormal === false || r.moltComplete === false ? 'warn' : ''}>{describe(r)}</span></div>
        <div className="muted small">{fmtTime(r.at)}</div>
        {r.note && <div className="pre">{r.note}</div>}
        {r.photo && <img className="thumb" src={r.photo} alt="记录照片" onClick={e => { e.stopPropagation(); setZoom(true) }} />}
      </div>
      {onDelete && <button className="icon sm" onClick={e => { e.stopPropagation(); onDelete() }} aria-label="删除">✕</button>}
      {zoom && <div className="lightbox" onClick={e => { e.stopPropagation(); setZoom(false) }}><img src={r.photo} alt="记录照片" /></div>}
    </li>
  )
}

export default function PetDetail({ pet, records, reload, go }: Ctx & { pet: Pet }) {
  const s = petStatus(pet, records)
  const g = petGrowth(pet, records)
  const [editing, setEditing] = useState<{ type: RecordType; rec?: LogRecord } | null>(null)
  const [filter, setFilter] = useState<RecordType | 'all'>('all')
  const shown = s.rs.filter(r => filter === 'all' || r.type === filter)
  const weights = s.rs.filter(r => r.type === 'weight' && r.weight != null).reverse()
  const types = (Object.keys(RECORD_TYPES) as RecordType[]).filter(t => pet.species === 'snake' || t !== 'weight' || weights.length)

  async function del(r: LogRecord) {
    if (!confirm('删除这条记录？')) return
    await deleteRecord(r.id)
    await reload()
  }

  return (
    <>
      <section className="panel">
        <div className="row">
          <div className="avatar big">{SPECIES[pet.species].emoji}</div>
          <div className="grow">
            <div className="muted">{SPECIES[pet.species].label}{pet.breed && ` · ${pet.breed}`}{pet.sex !== 'unknown' && ` · ${pet.sex === 'male' ? '公' : '母'}`}</div>
            <div className="muted">入手 {pet.acquiredAt} · 每 {pet.feedInterval} 天喂食</div>
          </div>
          <button className="ghost" onClick={() => go({ name: 'petForm', id: pet.id })}>编辑</button>
        </div>
        <div className="kv">
          <div><span>年龄{g.estimated ? '（估算）' : ''}</span><b>{g.ageDays != null ? fmtAge(g.ageDays) : `已养 ${fmtAge(g.keptDays)}`}</b></div>
          {g.instar != null && <div><span>龄期</span><b>L{g.instar}</b></div>}
          {g.stage && <div><span>阶段</span><b><span className={`stage ${g.stage}`}>{STAGES[g.stage]}</span></b></div>}
          <div><span>上次喂食</span><b className={s.due ? 'warn' : ''}>{fmtDays(s.feedDays)}</b></div>
          <div><span>上次排便</span><b>{fmtDays(s.poopDays)}</b></div>
          <div><span>上次蜕皮</span><b>{s.lastMolt ? fmtDays(Math.floor((Date.now() - s.lastMolt.at) / 864e5)) : '无记录'}</b></div>
        </div>
        {s.warnings.map(w => <div key={w} className="alert">⚠️ {w}</div>)}
        {pet.notes && <p className="muted pre">{pet.notes}</p>}
      </section>

      <div className="quick wide">
        <QuickLog pet={pet} type="feed" reload={reload} />
        <QuickLog pet={pet} type="poop" reload={reload} />
      </div>
      <div className="addrow">
        {types.map(t => (
          <button key={t} onClick={() => setEditing({ type: t })}>{RECORD_TYPES[t].emoji}<small>{RECORD_TYPES[t].label}</small></button>
        ))}
      </div>

      {weights.length >= 2 && <section className="panel"><h3>体重变化</h3><WeightChart points={weights.map(r => ({ t: r.at, v: r.weight! }))} /></section>}

      <section className="panel">
        <h3>记录时间线</h3>
        <div className="chips small">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>全部</button>
          {types.map(t => <button key={t} className={filter === t ? 'on' : ''} onClick={() => setFilter(t)}>{RECORD_TYPES[t].label}</button>)}
        </div>
        {shown.length === 0 && <p className="empty">暂无记录</p>}
        <ul className="timeline">
          {shown.map(r => (
            <RecordItem key={r.id} r={r} onOpen={() => setEditing({ type: r.type, rec: r })} onDelete={() => del(r)} />
          ))}
        </ul>
      </section>

      {editing && <RecordForm pet={pet} records={records} type={editing.type} rec={editing.rec} onClose={() => setEditing(null)} reload={reload} />}
    </>
  )
}
