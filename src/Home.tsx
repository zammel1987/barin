import { useState } from 'react'
import type { Ctx } from './App'
import Alerts from './Alerts'
import { backupReminder, dismissBackupReminder, exportBackup } from './backup'
import { fmtAge, fmtDays, fmtDue, petStatus, type PetStatus } from './logic'
import { SPECIES, STAGES, type Pet, type Species } from './types'

type Sort = 'todo' | 'molt' | 'name'
const PAUSE_ICONS = { premolt: '⏳', hardening: '🛡', regurg: '🤢', acclim: '🏠' }

export function NextFeed({ s }: { s: PetStatus }) {
  if (s.pause) return <span className="paused-label">{PAUSE_ICONS[s.pause.kind]} {s.pause.label}</span>
  if (s.dueIn == null || s.nextDue == null) return null
  return <span className={s.dueIn <= 0 ? 'warn' : ''}>下次喂食：{fmtDue(s.dueIn, s.nextDue)}</span>
}

export default function Home({ pets, records, reload, go, toast }: Ctx) {
  const [filter, setFilter] = useState<Species | 'all' | 'archived'>('all')
  const [sort, setSort] = useState<Sort>('todo')
  const [, setTick] = useState(0)
  const now = Date.now()
  const active = pets.filter(p => !p.archivedAt)
  const archivedCount = pets.length - active.length
  const all = pets.map(p => ({ p, s: petStatus(p, records, now) }))
  const list = all
    .filter(({ p }) => filter === 'archived' ? !!p.archivedAt : !p.archivedAt && (filter === 'all' || p.species === filter))
    .sort((a, b) => compare(sort, a, b))
  const live = all.filter(x => !x.p.archivedAt)
  const overdue = live.filter(x => x.s.due && x.s.dueIn! < 0).length
  const today = live.filter(x => x.s.due && x.s.dueIn === 0).length
  const reminder = backupReminder(pets, records, now)

  return (
    <>
      {reminder && (
        <div className="banner">
          <span className="grow">💾 {reminder.never ? '还没有备份过数据' : `已 ${reminder.days} 天未备份（新增 ${reminder.fresh} 条）`}</span>
          <button onClick={() => { exportBackup(pets, records); setTick(t => t + 1) }}>立即导出</button>
          <button className="icon sm" aria-label="关闭" onClick={() => { dismissBackupReminder(); setTick(t => t + 1) }}>✕</button>
        </div>
      )}
      {active.length > 0 && (
        <div className="summary row">
          <span className="grow">共 {active.length} 只 · <b className={overdue ? 'warn' : ''}>{overdue} 只逾期</b> · <b>{today} 只今天</b></span>
          <button className="ghost sm-btn" onClick={() => go({ name: 'batch' })}>☑ 批量记录</button>
        </div>
      )}
      <div className="chips">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>全部</button>
        {(Object.keys(SPECIES) as Species[]).map(k => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{SPECIES[k].emoji} {SPECIES[k].label}</button>
        ))}
        {archivedCount > 0 && <button className={filter === 'archived' ? 'on' : ''} onClick={() => setFilter('archived')}>🗂 已归档（{archivedCount}）</button>}
      </div>
      {list.length > 1 && filter !== 'archived' && (
        <div className="chips small">
          <span className="muted small">排序：</span>
          {([['todo', '待办优先'], ['molt', '临近蜕皮'], ['name', '名字']] as [Sort, string][]).map(([k, l]) => (
            <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
      )}
      {list.length === 0 && <p className="empty">{filter === 'archived' ? '没有已归档的宠物' : '还没有宠物，点击下方按钮添加第一只吧。'}</p>}
      <div className="cards">
        {list.map(({ p, s }) => <PetCard key={p.id} p={p} s={s} records={records} reload={reload} toast={toast} onOpen={() => go({ name: 'pet', id: p.id })} />)}
      </div>
      <button className="fab" onClick={() => go({ name: 'petForm' })}>＋ 添加宠物</button>
    </>
  )
}

function PetCard({ p, s, records, reload, toast, onOpen }: { p: Pet; s: PetStatus; records: Ctx['records']; reload: Ctx['reload']; toast: Ctx['toast']; onOpen: () => void }) {
  const g = s.g
  const f = s.forecast
  return (
    <div className={`card ${s.due ? 'due' : ''} ${s.pause ? 'paused' : ''} ${p.archivedAt ? 'archived' : ''}`}>
      <div className="card-main" onClick={onOpen}>
        <div className="avatar">{SPECIES[p.species].emoji}</div>
        <div className="grow">
          <div className="name">{p.name} <span className="muted">{p.breed || SPECIES[p.species].label}</span>
            {g.stage && <span className={`stage ${g.stage}`}>{STAGES[g.stage]}{g.instar && g.stage !== 'adult' ? ` L${g.instar}` : ''}</span>}</div>
          {g.ageDays != null && <div className="muted small">{g.estimated ? '约 ' : ''}{fmtAge(g.ageDays)}{f && p.species !== 'snake' && !p.archivedAt ? ` · 本龄第 ${f.sinceDays + 1} 天${f.lastGap ? `（上一龄 ${f.lastGap} 天）` : ''}` : ''}</div>}
          {p.archivedAt ? <div className="muted small">已归档 {p.archivedAt}</div> : <>
            <div className="stats">
              <span>🍽️ {fmtDays(s.feedDays)}</span>
              <span>💩 {fmtDays(s.poopDays)}</span>
              {(s.care.water.every > 0 || s.care.water.days != null) && <span>💧 {fmtDays(s.care.water.days)}</span>}
              {(s.care.mist.every > 0 || s.care.mist.days != null) && <span>💦 {fmtDays(s.care.mist.days)}</span>}
            </div>
            <div className="next small"><NextFeed s={s} /></div>
          </>}
          <Alerts alerts={s.alerts} pet={p} records={records} reload={reload} toast={toast} />
        </div>
      </div>
    </div>
  )
}

function compare(sort: Sort, a: { p: Pet; s: PetStatus }, b: { p: Pet; s: PetStatus }) {
  if (sort === 'name') return a.p.name.localeCompare(b.p.name, 'zh-CN')
  if (sort === 'molt') return (a.s.forecast?.start ?? Infinity) - (b.s.forecast?.start ?? Infinity) || a.p.name.localeCompare(b.p.name, 'zh-CN')
  // 待办优先：暂停中的放最后，其余按下次喂食日
  const rank = (x: PetStatus) => (x.pause || x.dueIn == null ? 1e9 : x.dueIn)
  return rank(a.s) - rank(b.s) || b.s.alerts.length - a.s.alerts.length
}
