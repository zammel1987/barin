import { useState } from 'react'
import type { Ctx } from './App'
import { deletePet, putPet, uid } from './db'
import { localDate } from './logic'
import NumInput from './NumInput'
import { ARCHIVE_REASONS, SPECIES, STAGES, type ArchiveReason, type Pet, type Species, type Stage } from './types'

export default function PetForm({ pet, records, reload, go }: Ctx & { pet?: Pet }) {
  const [f, setF] = useState<Pet>(pet ?? {
    id: uid(), name: '', species: 'spider', breed: '', sex: 'unknown',
    acquiredAt: localDate(), notes: '', createdAt: Date.now(),
  })
  const set = <K extends keyof Pet>(k: K, v: Pet[K]) => setF(o => ({ ...o, [k]: v }))
  const [archiving, setArchiving] = useState(false)
  const [archive, setArchive] = useState<{ reason: ArchiveReason; date: string; note: string }>({ reason: 'dead', date: localDate(), note: '' })
  const petRecords = pet ? records.filter(r => r.petId === pet.id) : []

  // 只保存填写了且 ≥1 的阶段间隔，其余沿用物种默认值
  const cleaned = (): Pet => ({
    ...f, name: f.name.trim(),
    feedIntervals: Object.fromEntries(Object.entries(f.feedIntervals ?? {}).filter(([, v]) => v != null && v >= 1)),
  })

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim()) return
    await putPet(cleaned())
    await reload()
    go({ name: 'pet', id: f.id })
  }
  async function doArchive() {
    if (!f.name.trim()) return
    await putPet({ ...cleaned(), archivedAt: archive.date, archiveReason: archive.reason, archiveNote: archive.note.trim() || undefined, premoltSince: undefined })
    await reload()
    go({ name: 'home' })
  }
  async function unarchive() {
    await putPet({ ...cleaned(), archivedAt: undefined, archiveReason: undefined, archiveNote: undefined })
    await reload()
    go({ name: 'pet', id: f.id })
  }
  async function remove() {
    if (!pet) return
    const photos = petRecords.filter(r => r.photo).length
    if (!confirm(`确定删除「${pet.name}」？\n将同时删除 ${petRecords.length} 条记录、${photos} 张照片，且不可恢复。\n\n如果是死亡或转让，建议改用「归档」保留记录。`)) return
    await deletePet(pet.id)
    await reload()
    go({ name: 'home' })
  }

  return (
    <>
    <form className="form" onSubmit={save}>
      <label>种类</label>
      {pet ? (
        // 编辑已有宠物时种类固定，避免误点切换
        <div className="seg"><button type="button" className="on" disabled>{SPECIES[f.species].emoji} {SPECIES[f.species].label}</button></div>
      ) : <div className="seg">
        {(Object.keys(SPECIES) as Species[]).map(k => (
          <button type="button" key={k} className={f.species === k ? 'on' : ''}
            onClick={() => set('species', k)}>
            {SPECIES[k].emoji} {SPECIES[k].label}
          </button>
        ))}
      </div>}
      <label>名字 *<input value={f.name} onChange={e => set('name', e.target.value)} required placeholder="例如：小黑" /></label>
      <label>品种<input value={f.breed} onChange={e => set('breed', e.target.value)} placeholder={f.species === 'spider' ? '例如：智利红玫瑰' : f.species === 'snake' ? '例如：玉米蛇' : '例如：兰花螳螂'} /></label>
      <label>性别
        <select value={f.sex} onChange={e => set('sex', e.target.value as Pet['sex'])}>
          <option value="unknown">未知</option><option value="male">公</option><option value="female">母</option>
        </select>
      </label>
      <label>入手日期<input type="date" required value={f.acquiredAt} onChange={e => e.target.value && set('acquiredAt', e.target.value)} /></label>
      <label>出生/孵化日期（可选，知道的话年龄更准确）<input type="date" value={f.hatchDate ?? ''} onChange={e => set('hatchDate', e.target.value || undefined)} /></label>
      {f.species !== 'snake' && <>
        <label>入手时已蜕皮次数（L1 为刚孵化，蜕 4 次即 L5）
          <NumInput value={f.initialMolts} onChange={v => set('initialMolts', v)} placeholder="例如：4" />
        </label>
        <label>成体龄期（默认 L{SPECIES[f.species].adultInstar}，可按品种调整）
          <NumInput value={f.adultInstar} onChange={v => set('adultInstar', v)} placeholder={String(SPECIES[f.species].adultInstar)} />
        </label>
        <label>成长阶段
          <select value={f.stageOverride ?? ''} onChange={e => set('stageOverride', (e.target.value || undefined) as Stage | undefined)}>
            <option value="">按龄期自动判断</option>
            {(Object.keys(STAGES) as Stage[]).map(k => <option key={k} value={k}>{STAGES[k]}</option>)}
          </select>
        </label>
      </>}
      {f.species === 'snake' && <>
        <label>入手时大约月龄（不知道出生日期时用于估算年龄）
          <NumInput value={f.initialAgeMonths} onChange={v => set('initialAgeMonths', v)} placeholder="例如：3" />
        </label>
        <label>入手前已蜕皮次数（可选）
          <NumInput value={f.initialMolts} onChange={v => set('initialMolts', v)} placeholder="不知道可留空" />
        </label>
        <label>成体月龄（默认 {SPECIES.snake.adultMonths} 个月，可按品种调整）
          <NumInput value={f.adultMonths} onChange={v => set('adultMonths', v)} placeholder={String(SPECIES.snake.adultMonths)} />
        </label>
        <label>成长阶段
          <select value={f.stageOverride ?? ''} onChange={e => set('stageOverride', (e.target.value || undefined) as Stage | undefined)}>
            <option value="">按年龄自动判断</option>
            {(Object.keys(STAGES) as Stage[]).map(k => <option key={k} value={k}>{STAGES[k]}</option>)}
          </select>
        </label>
      </>}
      <label>各阶段喂食间隔（天，留空使用默认值）</label>
      <div className="intervals">
        {(Object.keys(STAGES) as Stage[]).map(st => (
          <label key={st}>{STAGES[st]}
            <NumInput value={f.feedIntervals?.[st]} placeholder={String(SPECIES[f.species].intervals[st])}
              onChange={v => set('feedIntervals', { ...f.feedIntervals, [st]: v })} />
          </label>
        ))}
      </div>
      <details className="more">
        <summary>更多设置</summary>
        {f.species !== 'snake' && (
          <label>蜕皮后硬化期（天，期间不提醒喂食；留空按阶段默认：{(Object.keys(STAGES) as Stage[]).map(st => `${STAGES[st]} ${SPECIES[f.species].harden[st]}`).join(' / ')}）
            <NumInput value={f.hardenDays} onChange={v => set('hardenDays', v)} placeholder="按阶段默认" />
          </label>
        )}
        <label>到家适应期（天，期间不提醒喂食；默认 {SPECIES[f.species].acclimDays} 天）
          <NumInput value={f.acclimDays} onChange={v => set('acclimDays', v)} placeholder={String(SPECIES[f.species].acclimDays)} />
        </label>
      </details>
      <label>备注<textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={3} /></label>
      <button className="primary" type="submit">保存</button>
    </form>
    {pet && <div className="form form-actions">
      {pet.archivedAt ? (
        <button type="button" className="ghost" onClick={unarchive}>↩ 恢复为在养（当前已归档：{ARCHIVE_REASONS[pet.archiveReason ?? 'other']} {pet.archivedAt}）</button>
      ) : archiving ? (
        <section className="panel">
          <h3>归档「{pet.name}」</h3>
          <p className="muted small">归档后不再提醒，记录全部保留，可在首页「已归档」中查看，也可以恢复。</p>
          <div className="seg">
            {(Object.keys(ARCHIVE_REASONS) as ArchiveReason[]).map(k => (
              <button type="button" key={k} className={archive.reason === k ? 'on' : ''} onClick={() => setArchive(a => ({ ...a, reason: k }))}>{ARCHIVE_REASONS[k]}</button>
            ))}
          </div>
          <label>日期<input type="date" value={archive.date} onChange={e => e.target.value && setArchive(a => ({ ...a, date: e.target.value }))} /></label>
          <label>说明（可选）<input value={archive.note} onChange={e => setArchive(a => ({ ...a, note: e.target.value }))} placeholder="例如：蜕皮失败 / 转给朋友" /></label>
          <div className="row">
            <button type="button" className="ghost grow" onClick={() => setArchiving(false)}>取消</button>
            <button type="button" className="primary grow" onClick={doArchive}>确认归档</button>
          </div>
        </section>
      ) : (
        <button type="button" className="ghost" onClick={() => setArchiving(true)}>🗂 归档（死亡 / 转让）</button>
      )}
      <button type="button" className="danger" onClick={remove}>删除宠物</button>
    </div>}
    </>
  )
}
