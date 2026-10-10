import { useState } from 'react'
import { fmtTime } from './logic'
import { disableSync, enableSync, syncNow, useSyncState } from './sync'

export default function SyncPanel() {
  const s = useSyncState()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [working, setWorking] = useState(false)

  async function on(e: React.FormEvent) {
    e.preventDefault()
    setWorking(true)
    setMsg('')
    try {
      await enableSync(code)
      setCode('')
    } catch (err) {
      setMsg((err as Error).message)
    }
    setWorking(false)
  }
  function off() {
    if (confirm('关闭后，本设备不再上传和接收改动。本设备和服务器上已有的数据都会保留。确定关闭？')) disableSync()
  }

  return (
    <section className="panel">
      <h3>服务器同步</h3>
      {s.enabled ? <>
        <p className="muted">已开启。记录会自动保存到服务器，其他设备填同一个口令就能看到同一份数据；离线时照常记录，联网后自动补传。</p>
        <p className="muted small">{s.busy ? '正在同步…' : `上次同步：${s.lastAt ? fmtTime(s.lastAt) : '还没有成功过'}`}{s.pending > 0 && ` · 待上传 ${s.pending} 项`}</p>
        {s.error && <p className={`alert ${s.offline ? 'info' : 'danger'}`}>{s.error}</p>}
        <button className="primary" disabled={s.busy} onClick={() => syncNow()}>立即同步</button>
        <button className="ghost" onClick={off}>在本设备关闭同步</button>
      </> : <form className="form" onSubmit={on}>
        <p className="muted">开启后，记录会自动保存到服务器，手机、电脑等多台设备看到同一份数据。本设备已有的记录会和服务器上的合并，不会被清空。</p>
        <label>同步口令
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="保存在服务器上，形如 abcde-fghjk-mnpqr-stuvw" autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} />
        </label>
        <button className="primary" disabled={working || !code.trim()}>{working ? '正在连接…' : '开启同步'}</button>
        {msg && <p className="alert danger">{msg}</p>}
      </form>}
    </section>
  )
}
