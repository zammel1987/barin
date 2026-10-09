import { useCallback, useEffect, useState } from 'react'
import { getAll } from './db'
import type { LogRecord, Pet } from './types'
import Home from './Home'
import PetDetail from './PetDetail'
import PetForm from './PetForm'
import Settings from './Settings'
import Calendar from './Calendar'

export type View = { name: 'home' } | { name: 'pet'; id: string } | { name: 'petForm'; id?: string } | { name: 'settings' } | { name: 'calendar' }

export default function App() {
  const [pets, setPets] = useState<Pet[]>([])
  const [records, setRecords] = useState<LogRecord[]>([])
  const [view, setView] = useState<View>({ name: 'home' })
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    const d = await getAll()
    setPets(d.pets.sort((a, b) => a.createdAt - b.createdAt))
    setRecords(d.records)
    setLoaded(true)
  }, [])
  useEffect(() => { reload() }, [reload])

  const ctx = { pets, records, reload, go: setView }
  const pet = view.name === 'pet' ? pets.find(p => p.id === view.id) : undefined

  return (
    <div className="app">
      <header className="topbar">
        {view.name !== 'home' ? <button className="icon" onClick={() => setView({ name: 'home' })} aria-label="返回">‹</button> : <span className="logo">🦎</span>}
        <h1>{view.name === 'pet' && pet ? pet.name : view.name === 'petForm' ? (view.id ? '编辑宠物' : '添加宠物') : view.name === 'settings' ? '设置与备份' : view.name === 'calendar' ? '日历' : '爬宠饲养记录'}</h1>
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
          : <Settings {...ctx} />}
      </main>
    </div>
  )
}

export interface Ctx { pets: Pet[]; records: LogRecord[]; reload: () => Promise<void>; go: (v: View) => void }
