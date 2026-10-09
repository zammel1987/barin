import { useState } from 'react'
import type { ToastMsg } from './App'
import { confirmFeed } from './actions'
import { deleteRecord, putRecord, uid } from './db'
import { recentFoods } from './logic'
import type { LogRecord, Pet } from './types'

// 一键记录：喂食沿用上一次的食物和数量，默认“已吃”；排便默认“正常”
export default function QuickLog({ pet, records, type, reload, toast }: {
  pet: Pet; records: LogRecord[]; type: 'feed' | 'poop'; reload: () => Promise<void>; toast: (t: ToastMsg) => void
}) {
  const [done, setDone] = useState(false)
  const last = type === 'feed' ? recentFoods(pet.id, records, 1)[0] : undefined
  async function log() {
    if (type === 'feed' && !confirmFeed(pet, records)) return
    const r: LogRecord = {
      id: uid(), petId: pet.id, type, at: Date.now(), note: '',
      ...(type === 'feed' ? { feedResult: 'eaten' as const, food: last?.food, quantity: last?.quantity ?? 1 } : { poopNormal: true }),
    }
    await putRecord(r)
    await reload()
    setDone(true)
    setTimeout(() => setDone(false), 1200)
    toast({ text: `已记录${type === 'feed' ? '喂食' : '排便'}`, undo: async () => { await deleteRecord(r.id); await reload() } })
  }
  return (
    <button className={`quick-btn ${done ? 'ok' : ''}`} onClick={log}>
      {done ? '✓ 已记录' : type === 'feed' ? `🍽️ 喂食${last ? ` · ${last.food}${last.quantity ? `×${last.quantity}` : ''}` : ''}` : '💩 排便'}
    </button>
  )
}
