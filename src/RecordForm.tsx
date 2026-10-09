import { useState } from 'react'
import type { ToastMsg } from './App'
import { confirmFeed } from './actions'
import { deleteRecord, getPet, putPet, putRecord, putRecordAndPet, uid } from './db'
import { addDays, dayDiff, petGrowth, recentFoods, startOfDay, toLocalInput } from './logic'
import { compressImage } from './photo'
import NumInput from './NumInput'
import { FEED_RESULTS, RECORD_TYPES, SPECIES, type FeedResult, type LogRecord, type Pet, type RecordType } from './types'

export default function RecordForm({ pet, records, type, rec, onClose, reload, toast }: {
  pet: Pet; records: LogRecord[]; type: RecordType; rec?: LogRecord; onClose: () => void; reload: () => Promise<void>; toast: (t: ToastMsg) => void
}) {
  const isArthropod = pet.species !== 'snake'
  const foods = recentFoods(pet.id, records)
  const [busy, setBusy] = useState(false)
  const [qtyKey, setQtyKey] = useState(0) // 点食物快捷按钮时重建数量输入框
  const [r, setR] = useState<LogRecord>(rec ?? {
    id: uid(), petId: pet.id, type, at: Date.now(), note: '',
    // 喂食默认沿用这只上一次的食物和数量
    ...(type === 'feed' && { food: foods[0]?.food ?? SPECIES[pet.species].foods[0], quantity: foods[0]?.quantity ?? 1, feedResult: 'eaten' as const }),
    ...(type === 'poop' && { poopNormal: true }),
    ...(type === 'molt' && { moltComplete: true, instar: isArthropod ? petGrowth(pet, records).instar! + 1 : undefined }),
  })
  const set = <K extends keyof LogRecord>(k: K, v: LogRecord[K]) => setR(o => ({ ...o, [k]: v }))

  function setResult(k: FeedResult) {
    setR(o => ({
      ...o, feedResult: k,
      // 拒食/吃剩时默认认为活饵还在缸里（蛇默认不勾）
      preyLeft: k === 'refused' || k === 'partial' ? (o.feedResult === 'refused' || o.feedResult === 'partial' ? o.preyLeft : isArthropod) : undefined,
      regurgAt: k === 'regurgitated' ? (o.regurgAt ?? (rec ? Date.now() : undefined)) : undefined,
    }))
  }
  // 快捷切换日期，保留时分
  function shiftDay(offset: number) {
    const t = r.at - startOfDay(r.at)
    set('at', addDays(Date.now(), -offset) + t)
  }
  const dayOffset = dayDiff(r.at, Date.now())

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!rec && type === 'feed' && !confirmFeed(pet, records)) return
    // 记录蜕皮时结束手动标记的蜕皮前期，并记下前期天数；记录和宠物在同一事务中写入
    const premoltSince = pet.premoltSince
    const endsPremolt = !rec && type === 'molt' && premoltSince != null
    const saved = endsPremolt ? { ...r, premoltDays: Math.max(0, dayDiff(premoltSince, r.at)) } : r
    if (endsPremolt) await putRecordAndPet(saved, { ...pet, premoltSince: undefined })
    else await putRecord(saved)
    await reload()
    onClose()
    if (!rec) toast({
      text: `已记录${RECORD_TYPES[type].label}`,
      undo: async () => {
        await deleteRecord(saved.id)
        // 只恢复蜕皮前期这一项，读取最新的宠物资料，避免覆盖期间的其他修改
        const cur = endsPremolt ? await getPet(pet.id) : undefined
        if (cur) await putPet({ ...cur, premoltSince })
        await reload()
      },
    })
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="sheet form" onClick={e => e.stopPropagation()} onSubmit={save}>
        <h3>{RECORD_TYPES[type].emoji} {rec ? '编辑' : '记录'}{RECORD_TYPES[type].label}</h3>
        <label>时间<input type="datetime-local" value={toLocalInput(r.at)} onChange={e => e.target.value && set('at', new Date(e.target.value).getTime())} /></label>
        <div className="seg small-seg">
          {['今天', '昨天', '前天'].map((l, i) => (
            <button type="button" key={l} className={dayOffset === i ? 'on' : ''} onClick={() => shiftDay(i)}>{l}</button>
          ))}
        </div>

        {type === 'feed' && <>
          {foods.length > 0 && (
            <div className="seg small-seg">
              {foods.map(f => (
                <button type="button" key={`${f.food}×${f.quantity}`} className={r.food === f.food && r.quantity === f.quantity ? 'on' : ''}
                  onClick={() => { setR(o => ({ ...o, food: f.food, quantity: f.quantity })); setQtyKey(k => k + 1) }}>{f.food}{f.quantity ? `×${f.quantity}` : ''}</button>
              ))}
            </div>
          )}
          <label>食物
            <input list="foods" value={r.food ?? ''} onChange={e => set('food', e.target.value)} />
            <datalist id="foods">{SPECIES[pet.species].foods.map(f => <option key={f} value={f} />)}</datalist>
          </label>
          <label>数量<NumInput key={qtyKey} value={r.quantity} onChange={v => set('quantity', v)} /></label>
          <label>进食情况</label>
          <div className="seg">
            {(Object.keys(FEED_RESULTS) as FeedResult[]).filter(k => k !== 'regurgitated' || !isArthropod).map(k => (
              <button type="button" key={k} className={r.feedResult === k ? 'on' : ''} onClick={() => setResult(k)}>{FEED_RESULTS[k]}</button>
            ))}
          </div>
          {(r.feedResult === 'refused' || r.feedResult === 'partial') && (
            <label className="check"><input type="checkbox" checked={!!r.preyLeft} onChange={e => set('preyLeft', e.target.checked)} />活饵/残渣仍在缸内（提醒我取出）</label>
          )}
          {r.preyLeft && r.preyRemovedAt && <p className="muted small">已于 {new Date(r.preyRemovedAt).toLocaleString('zh-CN')} 取出</p>}
          {r.feedResult === 'regurgitated' && <>
            <label>吐食时间<input type="datetime-local" value={toLocalInput(r.regurgAt ?? r.at)} onChange={e => e.target.value && set('regurgAt', new Date(e.target.value).getTime())} /></label>
            <p className="muted small">吐食后会暂停喂食提醒 14 天（30 天内再次吐食为 21 天），下次建议换小一号猎物。</p>
          </>}
        </>}

        {type === 'poop' && <>
          <label>状态</label>
          <div className="seg">
            <button type="button" className={r.poopNormal !== false ? 'on' : ''} onClick={() => set('poopNormal', true)}>正常</button>
            <button type="button" className={r.poopNormal === false ? 'on' : ''} onClick={() => set('poopNormal', false)}>异常</button>
          </div>
        </>}

        {type === 'molt' && <>
          {isArthropod && <label>蜕皮后龄期（L）<NumInput value={r.instar} onChange={v => set('instar', v)} /></label>}
          <label>蜕皮是否完整</label>
          <div className="seg">
            <button type="button" className={r.moltComplete !== false ? 'on' : ''} onClick={() => set('moltComplete', true)}>完整</button>
            <button type="button" className={r.moltComplete === false ? 'on' : ''} onClick={() => set('moltComplete', false)}>不完整/卡皮</button>
          </div>
          {!rec && pet.premoltSince != null && <p className="muted small">保存后将结束「{SPECIES[pet.species].premoltName}」状态。</p>}
        </>}

        {type === 'weight' && <label>体重（克）<NumInput decimal required value={r.weight} onChange={v => set('weight', v)} /></label>}

        <label>照片</label>
        {r.photo ? (
          <div className="photo-edit">
            <img src={r.photo} alt="记录照片" />
            <button type="button" className="ghost" onClick={() => set('photo', undefined)}>移除照片</button>
          </div>
        ) : (
          <label className="ghost upload">{busy ? '处理中…' : '📷 拍照 / 选择照片'}
            <input type="file" accept="image/*" hidden onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              setBusy(true)
              try { set('photo', await compressImage(file)) } catch { alert('无法读取该图片') } finally { setBusy(false) }
            }} />
          </label>
        )}
        <label>备注<textarea rows={3} value={r.note} onChange={e => set('note', e.target.value)} placeholder={type === 'poop' ? '颜色、形状、尿酸等' : ''} /></label>
        <div className="row">
          <button type="button" className="ghost grow" onClick={onClose}>取消</button>
          <button type="submit" className="primary grow" disabled={busy}>保存</button>
        </div>
      </form>
    </div>
  )
}
