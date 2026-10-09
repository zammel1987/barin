import { markPremolt, markPreyRemoved } from './actions'
import type { Alert } from './logic'
import type { LogRecord, Pet } from './types'

const ICONS = { info: 'ℹ️', warn: '⚠️', danger: '⛔' }

export default function Alerts({ alerts, pet, records, reload }: { alerts: Alert[]; pet: Pet; records: LogRecord[]; reload: () => Promise<void> }) {
  async function act(a: Alert) {
    if (a.action?.kind === 'markPremolt') await markPremolt(pet, a.action.since)
    else if (a.action?.kind === 'preyRemoved') await markPreyRemoved(pet, records)
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
