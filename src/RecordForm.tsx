import { useState } from 'react'
import { putRecord, uid } from './db'
import { toLocalInput } from './logic'
import { FEED_RESULTS, RECORD_TYPES, SPECIES, type FeedResult, type LogRecord, type Pet, type RecordType } from './types'

export default function RecordForm({ pet, type, rec, onClose, reload }: {
  pet: Pet; type: RecordType; rec?: LogRecord; onClose: () => void; reload: () => Promise<void>
}) {
  const [r, setR] = useState<LogRecord>(rec ?? {
    id: uid(), petId: pet.id, type, at: Date.now(), note: '',
    ...(type === 'feed' && { food: SPECIES[pet.species].foods[0], quantity: 1, feedResult: 'eaten' as const }),
    ...(type === 'poop' && { poopNormal: true }),
    ...(type === 'molt' && { moltComplete: true }),
  })
  const set = <K extends keyof LogRecord>(k: K, v: LogRecord[K]) => setR(o => ({ ...o, [k]: v }))
  const isArthropod = pet.species !== 'snake'

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await putRecord(r)
    await reload()
    onClose()
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="sheet form" onClick={e => e.stopPropagation()} onSubmit={save}>
        <h3>{RECORD_TYPES[type].emoji} {rec ? '编辑' : '记录'}{RECORD_TYPES[type].label}</h3>
        <label>时间<input type="datetime-local" value={toLocalInput(r.at)} onChange={e => e.target.value && set('at', new Date(e.target.value).getTime())} /></label>

        {type === 'feed' && <>
          <label>食物
            <input list="foods" value={r.food ?? ''} onChange={e => set('food', e.target.value)} />
            <datalist id="foods">{SPECIES[pet.species].foods.map(f => <option key={f} value={f} />)}</datalist>
          </label>
          <label>数量<input type="number" min={0} value={r.quantity ?? ''} onChange={e => set('quantity', e.target.value === '' ? undefined : Number(e.target.value))} /></label>
          <label>进食情况</label>
          <div className="seg">
            {(Object.keys(FEED_RESULTS) as FeedResult[]).map(k => (
              <button type="button" key={k} className={r.feedResult === k ? 'on' : ''} onClick={() => set('feedResult', k)}>{FEED_RESULTS[k]}</button>
            ))}
          </div>
        </>}

        {type === 'poop' && <>
          <label>状态</label>
          <div className="seg">
            <button type="button" className={r.poopNormal !== false ? 'on' : ''} onClick={() => set('poopNormal', true)}>正常</button>
            <button type="button" className={r.poopNormal === false ? 'on' : ''} onClick={() => set('poopNormal', false)}>异常</button>
          </div>
        </>}

        {type === 'molt' && <>
          {isArthropod && <label>蜕皮后龄期（L）<input type="number" min={1} value={r.instar ?? ''} onChange={e => set('instar', e.target.value === '' ? undefined : Number(e.target.value))} /></label>}
          <label>蜕皮是否完整</label>
          <div className="seg">
            <button type="button" className={r.moltComplete !== false ? 'on' : ''} onClick={() => set('moltComplete', true)}>完整</button>
            <button type="button" className={r.moltComplete === false ? 'on' : ''} onClick={() => set('moltComplete', false)}>不完整/卡皮</button>
          </div>
        </>}

        {type === 'weight' && <label>体重（克）<input type="number" step="0.1" min={0} required value={r.weight ?? ''} onChange={e => set('weight', e.target.value === '' ? undefined : Number(e.target.value))} /></label>}

        <label>备注<textarea rows={3} value={r.note} onChange={e => set('note', e.target.value)} placeholder={type === 'poop' ? '颜色、形状、尿酸等' : ''} /></label>
        <div className="row">
          <button type="button" className="ghost grow" onClick={onClose}>取消</button>
          <button type="submit" className="primary grow">保存</button>
        </div>
      </form>
    </div>
  )
}
