import { useState } from 'react'
import type { Ctx } from './App'
import { deletePet, putPet, uid } from './db'
import NumInput from './NumInput'
import { SPECIES, STAGES, type Pet, type Species, type Stage } from './types'

export default function PetForm({ pet, reload, go }: Ctx & { pet?: Pet }) {
  const [f, setF] = useState<Pet>(pet ?? {
    id: uid(), name: '', species: 'spider', breed: '', sex: 'unknown',
    acquiredAt: new Date().toISOString().slice(0, 10), notes: '', createdAt: Date.now(),
  })
  const set = <K extends keyof Pet>(k: K, v: Pet[K]) => setF(o => ({ ...o, [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim()) return
    // 只保存填写了且 ≥1 的阶段间隔，其余沿用物种默认值
    const feedIntervals = Object.fromEntries(Object.entries(f.feedIntervals ?? {}).filter(([, v]) => v != null && v >= 1))
    await putPet({ ...f, name: f.name.trim(), feedIntervals })
    await reload()
    go({ name: 'pet', id: f.id })
  }
  async function remove() {
    if (!pet || !confirm(`确定删除「${pet.name}」及其所有记录？此操作不可恢复。`)) return
    await deletePet(pet.id)
    await reload()
    go({ name: 'home' })
  }

  return (
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
      <label>入手日期<input type="date" value={f.acquiredAt} onChange={e => set('acquiredAt', e.target.value)} /></label>
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
      <label>备注<textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={3} /></label>
      <button className="primary" type="submit">保存</button>
      {pet && <button type="button" className="danger" onClick={remove}>删除宠物</button>}
    </form>
  )
}
