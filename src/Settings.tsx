import { useRef, useState } from 'react'
import type { Ctx } from './App'
import { importBackup, type Backup } from './db'

export default function Settings({ pets, records, reload }: Ctx) {
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  function exportJson() {
    const b: Backup = { version: 1, exportedAt: new Date().toISOString(), pets, records }
    const url = URL.createObjectURL(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `爬宠记录备份-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const b = JSON.parse(await f.text()) as Backup
      const replace = confirm(`备份含 ${b.pets?.length ?? 0} 只宠物、${b.records?.length ?? 0} 条记录。\n\n确定：覆盖现有数据\n取消：合并到现有数据`)
      await importBackup(b, replace)
      await reload()
      setMsg('导入成功')
    } catch (err) {
      setMsg(`导入失败：${(err as Error).message}`)
    }
  }

  return (
    <div className="form">
      <section className="panel">
        <h3>数据备份</h3>
        <p className="muted">数据只保存在本设备浏览器中。清除浏览器数据会导致丢失，请定期导出备份。</p>
        <p>当前：{pets.length} 只宠物，{records.length} 条记录</p>
        <button className="primary" onClick={exportJson}>导出 JSON 备份</button>
        <button className="ghost" onClick={() => file.current?.click()}>从备份导入</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
        {msg && <p className="alert">{msg}</p>}
      </section>
      <section className="panel">
        <h3>安装到桌面</h3>
        <p className="muted">手机浏览器菜单中选择「添加到主屏幕」，即可像 App 一样离线使用。</p>
      </section>
    </div>
  )
}
