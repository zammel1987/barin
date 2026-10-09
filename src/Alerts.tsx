import type { ToastMsg } from './App'
import { markPremolt, markPreyRemoved } from './actions'
import { deleteRecord, putRecord, uid } from './db'
import type { Alert } from './logic'
import { RECORD_TYPES, type LogRecord, type Pet } from './types'

const ICONS = { info: 'ℹ️', warn: '⚠️', danger: '⛔' }

export default function Alerts({ alerts, pet, records, reload, toast }: {
  alerts: Alert[]; pet: Pet; records: LogRecord[]; reload: () => Promise<void>; toast: (t: ToastMsg) => void
}) {
  async function act(a: Alert) {
    const action = a.action
    if (action?.kind === 'markPremolt') await markPremolt(pet, action.since)
    else if (action?.kind === 'preyRemoved') await markPreyRemoved(pet, records)
    else if (action?.kind === 'logCare') {
      // 一键记录加水/喷雾，可撤销
      const r: LogRecord = { id: uid(), petId: pet.id, type: action.type, at: Date.now(), note: '' }
      await putRecord(r)
      toast({ text: `已记录${pet.name}${RECORD_TYPES[action.type].label}`, undo: async () => { await deleteRecord(r.id); await reload() } })
    }
    await reload()
  }
  return (
    <>
      {alerts.map(a => (
        <div key={a.code} className={`alert ${a.level}`}>
          <span className="grow">{ICONS[a.level]} {a.text}</span>
          {a.action && <button className="alert-btn" onClick={e => { e.stopPropagation(); act(a) }}>{a.action.label}</button>}
        </div>
      ))}
    </>
  )
}
