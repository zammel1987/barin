import { useState } from 'react'
import type { Ctx } from './App'
import Alerts from './Alerts'
import { endPremolt, markPremolt } from './actions'
import { deleteRecord } from './db'
import { NextFeed } from './Home'
import { daysSince, fmtAge, fmtDays, fmtMD, fmtTime, firstMeal, petStatus } from './logic'
import { ARCHIVE_REASONS, FEED_RESULTS, RECORD_TYPES, SPECIES, STAGES, type LogRecord, type Pet, type RecordType } from './types'
import RecordForm from './RecordForm'
import QuickLog from './QuickLog'
import WeightChart from './WeightChart'

export function describe(r: LogRecord) {
  switch (r.type) {
    case 'feed': return [r.food, r.quantity ? `×${r.quantity}` : '', r.feedResult ? FEED_RESULTS[r.feedResult] : '', r.preyLeft && !r.preyRemovedAt ? '· 剩饵未取' : ''].filter(Boolean).join(' ')
    case 'poop': return r.poopNormal === false ? '异常' : '正常'
    case 'molt': return [r.instar ? `进入 L${r.instar}` : '', r.moltComplete === false ? '蜕皮不完整' : r.moltComplete ? '完整' : '', r.premoltDays != null ? `前期约 ${r.premoltDays} 天` : ''].filter(Boolean).join(' · ')
    case 'weight': return r.weight != null ? `${r.weight} g` : ''
    default: return ''
  }
}
const isBad = (r: LogRecord) => r.feedResult === 'refused' || r.feedResult === 'regurgitated' || r.poopNormal === false || r.moltComplete === false

export function RecordItem({ r, title, onOpen, onDelete }: { r: LogRecord; title?: string; onOpen: () => void; onDelete?: () => void }) {
  const [zoom, setZoom] = useState(false)
  return (
    <li onClick={onOpen}>
      <span className="t-icon">{RECORD_TYPES[r.type].emoji}</span>
      <div className="grow">
        <div>{title && <b>{title} · </b>}<b>{RECORD_TYPES[r.type].label}</b> <span className={isBad(r) ? 'warn' : ''}>{describe(r)}</span></div>
        <div className="muted small">{fmtTime(r.at)}</div>
        {r.note && <div className="pre">{r.note}</div>}
        {r.photo && <img className="thumb" src={r.photo} alt="记录照片" onClick={e => { e.stopPropagation(); setZoom(true) }} />}
      </div>
      {onDelete && <button className="icon sm" onClick={e => { e.stopPropagation(); onDelete() }} aria-label="删除">✕</button>}
      {zoom && <div className="lightbox" onClick={e => { e.stopPropagation(); setZoom(false) }}><img src={r.photo} alt="记录照片" /></div>}
    </li>
  )
}

export default function PetDetail({ pet, records, reload, go, toast }: Ctx & { pet: Pet }) {
  const s = petStatus(pet, records)
  const g = s.g
  const sp = SPECIES[pet.species]
  const [editing, setEditing] = useState<{ type: RecordType; rec?: LogRecord } | null>(null)
  const [filter, setFilter] = useState<RecordType | 'all'>('all')
  const shown = s.rs.filter(r => filter === 'all' || r.type === filter)
  const weights = s.rs.filter(r => r.type === 'weight' && r.weight != null).reverse()
  const types = (Object.keys(RECORD_TYPES) as RecordType[]).filter(t => pet.species === 'snake' || t !== 'weight' || weights.length)
  const meal = firstMeal(pet, records)
  const archived = !!pet.archivedAt
  // 成年螳螂不再蜕皮，不提供标记；但已处于蜕皮前期时始终可以结束
  const canPremolt = !archived && (pet.premoltSince != null || !(pet.species === 'mantis' && g.stage === 'adult'))
  const gaps = s.history.map(h => h.gapDays).filter((x): x is number => x != null)
  const avgGap = gaps.length ? Math.round(gaps.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, gaps.length)) : null

  async function del(r: LogRecord) {
    if (!confirm('删除这条记录？')) return
    await deleteRecord(r.id)
    await reload()
  }
  async function togglePremolt() {
    await (pet.premoltSince ? endPremolt(pet) : markPremolt(pet))
    await reload()
  }

  return (
    <>
      {archived && <div className="banner">🗂 已归档（{ARCHIVE_REASONS[pet.archiveReason ?? 'other']} · {pet.archivedAt}）{pet.archiveNote && ` · ${pet.archiveNote}`}</div>}
      <section className="panel">
        <div className="row">
          <div className="avatar big">{sp.emoji}</div>
          <div className="grow">
            <div className="muted">{sp.label}{pet.breed && ` · ${pet.breed}`}{pet.sex !== 'unknown' && ` · ${pet.sex === 'male' ? '公' : '母'}`}</div>
            <div className="muted">入手 {pet.acquiredAt} · {s.interval.label}每 {s.interval.days} 天喂食</div>
          </div>
          <button className="ghost" onClick={() => go({ name: 'petForm', id: pet.id })}>编辑</button>
        </div>
        <div className="kv">
          <div><span>年龄{g.estimated ? '（估算）' : ''}</span><b>{g.ageDays != null ? fmtAge(g.ageDays) : `已养 ${fmtAge(g.keptDays)}`}</b></div>
          {g.instar != null && g.stage !== 'adult' && <div><span>龄期</span><b>L{g.instar}</b></div>}
          {pet.species === 'snake' && <div><span>蜕皮次数</span><b>{g.totalMolts} 次</b></div>}
          {g.stage && <div><span>阶段</span><b><span className={`stage ${g.stage}`}>{STAGES[g.stage]}</span></b></div>}
          <div><span>上次喂食</span><b className={s.due ? 'warn' : ''}>{fmtDays(s.feedDays)}</b></div>
          <div><span>上次排便</span><b>{fmtDays(s.poopDays)}</b></div>
          <div><span>上次蜕皮</span><b>{s.lastMolt ? fmtDays(daysSince(s.lastMolt.at)) : '无记录'}</b></div>
          {meal && pet.species === 'snake' && <div><span>开食</span><b>{fmtMD(meal.at)}（第 {meal.day} 天）</b></div>}
        </div>
        {!archived && <div className="next"><NextFeed s={s} /></div>}
        <Alerts alerts={s.alerts} pet={pet} records={records} reload={reload} />
        {canPremolt && (
          <button className="ghost sm-btn" onClick={togglePremolt}>{pet.premoltSince ? `✓ 结束${sp.premoltName}` : `⏳ 标记为${sp.premoltName}`}</button>
        )}
        {pet.notes && <p className="muted pre">{pet.notes}</p>}
      </section>

      {!archived && <>
        <div className="quick wide">
          <QuickLog pet={pet} records={records} type="feed" reload={reload} toast={toast} />
          <QuickLog pet={pet} records={records} type="poop" reload={reload} toast={toast} />
        </div>
        <div className="addrow">
          {types.map(t => (
            <button key={t} onClick={() => setEditing({ type: t })}>{RECORD_TYPES[t].emoji}<small>{RECORD_TYPES[t].label}</small></button>
          ))}
        </div>
      </>}

      {s.history.length > 0 && (
        <section className="panel">
          <h3>蜕皮历史</h3>
          <table className="molt-table">
            <thead><tr><th>日期</th><th>{pet.species === 'snake' ? '次序' : '龄期'}</th><th>间隔</th><th>前期</th><th>完整</th></tr></thead>
            <tbody>
              {[...s.history].reverse().map((h, i) => (
                <tr key={h.id}>
                  <td>{fmtMD(h.at)}</td>
                  <td>{pet.species === 'snake' ? `第 ${s.history.length - i} 次` : h.instar ? `L${h.instar}` : '—'}</td>
                  <td>{h.gapDays != null ? `${h.gapDays} 天` : '—'}</td>
                  <td>{h.premoltDays != null ? `${h.premoltDays} 天` : '—'}</td>
                  <td className={h.complete === false ? 'warn' : ''}>{h.complete === false ? '不完整' : '完整'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {avgGap != null && <p className="muted small">最近 {Math.min(3, gaps.length)} 次平均间隔 {avgGap} 天</p>}
          {s.forecast && <p className="muted small">下次蜕皮预计 {fmtMD(s.forecast.start)}–{fmtMD(s.forecast.end)}{s.forecast.reference ? '（无历史间隔，按物种参考值）' : ''}，仅供参考</p>}
        </section>
      )}

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

      {editing && <RecordForm pet={pet} records={records} type={editing.type} rec={editing.rec} onClose={() => setEditing(null)} reload={reload} toast={toast} />}
    </>
  )
}
