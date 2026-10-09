import { useState } from 'react'
import { putRecord, uid } from './db'
import type { Pet } from './types'

// 一键记录：喂食默认“已吃”，排便默认“正常”
export default function QuickLog({ pet, type, reload }: { pet: Pet; type: 'feed' | 'poop'; reload: () => Promise<void> }) {
  const [done, setDone] = useState(false)
  async function log() {
    await putRecord({
      id: uid(), petId: pet.id, type, at: Date.now(), note: '',
      ...(type === 'feed' ? { feedResult: 'eaten' as const, quantity: 1 } : { poopNormal: true }),
    })
    await reload()
    setDone(true)
    setTimeout(() => setDone(false), 1200)
  }
  return (
    <button className={`quick-btn ${done ? 'ok' : ''}`} onClick={log}>
      {done ? '✓ 已记录' : type === 'feed' ? '🍽️ 喂食' : '💩 排便'}
    </button>
  )
}
