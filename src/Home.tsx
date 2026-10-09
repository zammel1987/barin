import { useState } from 'react'
import type { Ctx } from './App'
import { fmtAge, fmtDays, petGrowth, petStatus } from './logic'
import { SPECIES, STAGES, type Species } from './types'
import QuickLog from './QuickLog'

export default function Home({ pets, records, reload, go }: Ctx) {
  const [filter, setFilter] = useState<Species | 'all'>('all')
  const list = pets
    .filter(p => filter === 'all' || p.species === filter)
    .map(p => ({ p, s: petStatus(p, records), g: petGrowth(p, records) }))
    .sort((a, b) => Number(b.s.due) - Number(a.s.due))
  const dueCount = pets.filter(p => petStatus(p, records).due).length

  return (
    <>
      {pets.length > 0 && (
        <div className="summary">共 {pets.length} 只 · <b className={dueCount ? 'warn' : ''}>{dueCount} 只待喂食</b></div>
      )}
      <div className="chips">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>全部</button>
        {(Object.keys(SPECIES) as Species[]).map(k => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{SPECIES[k].emoji} {SPECIES[k].label}</button>
        ))}
      </div>
      {list.length === 0 && <p className="empty">还没有宠物，点击下方按钮添加第一只吧。</p>}
      <div className="cards">
        {list.map(({ p, s, g }) => (
          <div key={p.id} className={`card ${s.due ? 'due' : ''}`}>
            <div className="card-main" onClick={() => go({ name: 'pet', id: p.id })}>
              <div className="avatar">{SPECIES[p.species].emoji}</div>
              <div className="grow">
                <div className="name">{p.name} <span className="muted">{p.breed || SPECIES[p.species].label}</span>
                  {g.stage && <span className={`stage ${g.stage}`}>{STAGES[g.stage]}{g.instar ? ` L${g.instar}` : ''}</span>}</div>
                {g.ageDays != null && <div className="muted small">{g.estimated ? '约 ' : ''}{fmtAge(g.ageDays)}</div>}
                <div className="stats">
                  <span className={s.due ? 'warn' : ''}>🍽️ {fmtDays(s.feedDays)}</span>
                  <span>💩 {fmtDays(s.poopDays)}</span>
                </div>
                {s.warnings.map(w => <div key={w} className="alert">⚠️ {w}</div>)}
              </div>
            </div>
            <div className="quick">
              <QuickLog pet={p} type="feed" reload={reload} />
              <QuickLog pet={p} type="poop" reload={reload} />
            </div>
          </div>
        ))}
      </div>
      <button className="fab" onClick={() => go({ name: 'petForm' })}>＋ 添加宠物</button>
    </>
  )
}
