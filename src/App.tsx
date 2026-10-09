import { useCallback, useEffect, useRef, useState } from 'react'
import { getAll } from './db'
import type { LogRecord, Pet } from './types'
import Home from './Home'
import PetDetail from './PetDetail'
import PetForm from './PetForm'
import Settings from './Settings'
import Calendar from './Calendar'
import BatchLog from './BatchLog'

export type View = { name: 'home' } | { name: 'pet'; id: string } | { name: 'petForm'; id?: string } | { name: 'settings' } | { name: 'calendar' } | { name: 'batch' }
export interface ToastMsg { text: string; undo?: () => Promise<void> }

const TITLES: Record<View['name'], string> = { home: '爬宠饲养记录', pet: '', petForm: '', settings: '设置与备份', calendar: '日历', batch: '批量记录' }

export default function App() {
  const [pets, setPets] = useState<Pet[]>([])
  const [records, setRecords] = useState<LogRecord[]>([])
  const [view, setView] = useState<View>({ name: 'home' })
  const [loaded, setLoaded] = useState(false)
  const [toastMsg, setToastMsg] = useState<ToastMsg | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const reload = useCallback(async () => {
    const d = await getAll()
    setPets(d.pets.sort((a, b) => a.createdAt - b.createdAt))
    setRecords(d.records)
    setLoaded(true)
  }, [])
  useEffect(() => { reload() }, [reload])

  // 底部提示，5 秒后消失，可撤销
  const toast = useCallback((t: ToastMsg) => {
    clearTimeout(timer.current)
    setToastMsg(t)
    timer.current = setTimeout(() => setToastMsg(null), 5000)
  }, [])
  async function undo() {
    const u = toastMsg?.undo
    setToastMsg(null)
    if (u) await u()
  }

  const ctx: Ctx = { pets, records, reload, go: setView, toast }
  const pet = view.name === 'pet' ? pets.find(p => p.id === view.id) : undefined
  const title = view.name === 'pet' ? pet?.name ?? '' : view.name === 'petForm' ? (view.id ? '编辑宠物' : '添加宠物') : TITLES[view.name]

  return (
    <div className="app">
      <header className="topbar">
        {view.name !== 'home' ? <button className="icon" onClick={() => setView({ name: 'home' })} aria-label="返回">‹</button> : <span className="logo">🦎</span>}
        <h1>{title}</h1>
        {view.name === 'home' && <>
          <button className="icon" onClick={() => setView({ name: 'calendar' })} aria-label="日历">📅</button>
          <button className="icon" onClick={() => setView({ name: 'settings' })} aria-label="设置">⚙</button>
        </>}
      </header>
      <main>
        {!loaded ? <p className="empty">加载中…</p>
          : view.name === 'home' ? <Home {...ctx} />
          : view.name === 'pet' ? (pet ? <PetDetail {...ctx} pet={pet} /> : <p className="empty">宠物不存在</p>)
          : view.name === 'petForm' ? <PetForm {...ctx} pet={pets.find(p => p.id === view.id)} />
          : view.name === 'calendar' ? <Calendar {...ctx} />
          : view.name === 'batch' ? <BatchLog {...ctx} />
          : <Settings {...ctx} />}
      </main>
      {toastMsg && (
        <div className="toast" role="status">
          <span className="grow">{toastMsg.text}</span>
          {toastMsg.undo && <button onClick={undo}>撤销</button>}
        </div>
      )}
    </div>
  )
}

export interface Ctx { pets: Pet[]; records: LogRecord[]; reload: () => Promise<void>; go: (v: View) => void; toast: (t: ToastMsg) => void }
