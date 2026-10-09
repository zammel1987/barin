import { useRef } from 'react'
import type { ToastMsg } from './App'
import { endPremolt, markPremolt, quickMolt } from './actions'
import { petGrowth } from './logic'
import { SPECIES, type LogRecord, type Pet } from './types'

// 蜕皮前期相关按钮：标记 / 一键记录蜕皮（龄期或蜕皮次数自动 +1）/ 取消标记
export default function PremoltActions({ pet, records, reload, toast, compact }: {
  pet: Pet; records: LogRecord[]; reload: () => Promise<void>; toast: (t: ToastMsg) => void; compact?: boolean
}) {
  const busy = useRef(false) // 防止连点重复记录
  const name = SPECIES[pet.species].premoltName
  const g = petGrowth(pet, records)
  // 成年螳螂不再蜕皮：不提供标记和记录，只能取消已有标记
  const canMolt = !(pet.species === 'mantis' && g.stage === 'adult')

  async function run(fn: () => Promise<unknown>) {
    if (busy.current) return
    busy.current = true
    // 刷新后按钮会换成另一个（已蜕皮 ↔ 标记），保护期延长到界面更新之后，防止双击的第二下点到新按钮
    try { await fn(); await reload() } finally { setTimeout(() => { busy.current = false }, 600) }
  }
  const molted = () => run(async () => {
    const { record, undo } = await quickMolt(pet, records)
    const what = record.instar ? `进入 L${record.instar}` : `第 ${g.totalMolts + 1} 次`
    toast({ text: `已记录蜕皮（${what}），可在时间线补充是否完整、照片`, undo: async () => { await undo(); await reload() } })
  })
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  if (pet.premoltSince == null) {
    if (compact || !canMolt) return null
    return <button className="ghost sm-btn" onClick={() => run(() => markPremolt(pet))}>⏳ 标记为{name}</button>
  }
  return (
    <div className="premolt-actions" onClick={stop}>
      {canMolt && <button className="primary sm-btn" onClick={molted}>🔄 已蜕皮</button>}
      {!compact && <button className="ghost sm-btn" onClick={() => run(() => endPremolt(pet))}>取消标记（没有蜕皮）</button>}
    </div>
  )
}
