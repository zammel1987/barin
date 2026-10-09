import { useState } from 'react'
import type { Ctx } from './App'
import { deletePet, putPet, uid } from './db'
import { SPECIES, type Pet, type Species } from './types'

export default function PetForm({ pet, reload, go }: Ctx & { pet?: Pet }) {
  const [f, setF] = useState<Pet>(pet ?? {
    id: uid(), name: '', species: 'spider', breed: '', sex: 'unknown',
    acquiredAt: new Date().toISOString().slice(0, 10), feedInterval: SPECIES.spider.interval, notes: '', createdAt: Date.now(),
  })
  const set = <K extends keyof Pet>(k: K, v: Pet[K]) => setF(o => ({ ...o, [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim()) return
    await putPet({ ...f, name: f.name.trim(), feedInterval: Math.max(1, f.feedInterval || 1) })
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
      <div className="seg">
        {(Object.keys(SPECIES) as Species[]).map(k => (
          <button type="button" key={k} className={f.species === k ? 'on' : ''}
            onClick={() => setF(o => ({ ...o, species: k, feedInterval: pet ? o.feedInterval : SPECIES[k].interval }))}>
            {SPECIES[k].emoji} {SPECIES[k].label}
          </button>
        ))}
      </div>
      <label>名字 *<input value={f.name} onChange={e => set('name', e.target.value)} required placeholder="例如：小黑" /></label>
      <label>品种<input value={f.breed} onChange={e => set('breed', e.target.value)} placeholder={f.species === 'spider' ? '例如：智利红玫瑰' : f.species === 'snake' ? '例如：玉米蛇' : '例如：兰花螳螂'} /></label>
      <label>性别
        <select value={f.sex} onChange={e => set('sex', e.target.value as Pet['sex'])}>
          <option value="unknown">未知</option><option value="male">公</option><option value="female">母</option>
        </select>
      </label>
      <label>入手日期<input type="date" value={f.acquiredAt} onChange={e => set('acquiredAt', e.target.value)} /></label>
      <label>喂食间隔（天）<input type="number" min={1} value={f.feedInterval} onChange={e => set('feedInterval', Number(e.target.value))} /></label>
      <label>备注<textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={3} /></label>
      <button className="primary" type="submit">保存</button>
      {pet && <button type="button" className="danger" onClick={remove}>删除宠物</button>}
    </form>
  )
}
