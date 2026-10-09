import { useEffect, useRef, useState } from 'react'
import type { Ctx } from './App'
import { downloadBackup, exportBackup, getLastBackup } from './backup'
import { importBackup, validateBackup } from './db'
import { withExport } from './loadExport'
import { fmtTime } from './logic'
import { RECORD_TYPES, type LogRecord, type Pet, type RecordType } from './types'

// records 用于合并（可挂到本地已有宠物上）；replaceRecords 用于覆盖（只保留备份中宠物的记录）
interface Preview { pets: Pet[]; records: LogRecord[]; replaceRecords: LogRecord[]; skipped: number; photos: number; overlap: number; range: [number, number] | null }

const countByType = (rs: LogRecord[]) =>
  (Object.keys(RECORD_TYPES) as RecordType[]).map(t => [RECORD_TYPES[t].label, rs.filter(r => r.type === t).length] as const).filter(([, n]) => n).map(([l, n]) => `${l} ${n}`).join('、')

export default function Settings({ pets, records, reload }: Ctx) {
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [storage, setStorage] = useState<{ persisted: boolean | null; usage?: number; quota?: number }>({ persisted: null })
  const [lastBackup, setLastBackup] = useState(getLastBackup())

  useEffect(() => {
    (async () => {
      const persisted = (await navigator.storage?.persisted?.()) ?? null
      const est = await navigator.storage?.estimate?.()
      setStorage({ persisted, usage: est?.usage, quota: est?.quota })
    })().catch(() => {})
  }, [])

  async function requestPersist() {
    const ok = (await navigator.storage?.persist?.()) ?? false
    setStorage(s => ({ ...s, persisted: ok }))
    if (!ok) setMsg('浏览器未授予持久化存储。可以把网页添加到主屏幕后再试，并定期导出备份。')
  }

  function onExport() {
    exportBackup(pets, records)
    setLastBackup(getLastBackup())
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const v = validateBackup(JSON.parse(await f.text()), pets.map(p => p.id))
      const ids = new Set([...pets.map(p => p.id), ...records.map(r => r.id)])
      const times = v.records.map(r => r.at)
      const backupPetIds = new Set(v.pets.map(p => p.id))
      setPreview({
        ...v,
        replaceRecords: v.records.filter(r => backupPetIds.has(r.petId)),
        photos: v.records.filter(r => r.photo).length,
        overlap: [...v.pets, ...v.records].filter(x => ids.has(x.id)).length,
        range: times.length ? [Math.min(...times), Math.max(...times)] : null,
      })
      setMsg('')
    } catch (err) {
      setMsg(`无法读取备份：${(err as Error).message}`)
    }
  }

  async function doImport(replace: boolean) {
    if (!preview) return
    // 覆盖前先自动下载一份当前数据，防止误操作
    if (replace && (pets.length || records.length)) downloadBackup(pets, records, '导入前快照')
    try {
      const recs = replace ? preview.replaceRecords : preview.records
      await importBackup({ pets: preview.pets, records: recs }, replace)
      await reload()
      const skipped = preview.skipped + preview.records.length - recs.length
      setMsg(`导入成功：${preview.pets.length} 只宠物，${recs.length} 条记录（${countByType(recs) || '无'}）` + (skipped ? `；跳过无法识别的 ${skipped} 项` : ''))
    } catch (err) {
      setMsg(`导入失败：${(err as Error).message}`)
    }
    setPreview(null)
  }

  // 导出模块按需加载
  function onExportSheet(kind: 'xlsx' | 'csv') {
    return withExport(m => (kind === 'xlsx' ? m.exportXlsx(pets, records) : m.exportCsv(pets, records)), setMsg)
  }

  const mb = (n?: number) => (n == null ? '—' : `${(n / 1024 / 1024).toFixed(1)} MB`)

  return (
    <div className="form">
      <section className="panel">
        <h3>数据备份</h3>
        <p className="muted">数据只保存在本设备浏览器中，无账号、无服务器、不限数量。清除浏览器数据或更换手机会导致丢失，请定期导出备份。</p>
        <p>当前：{pets.length} 只宠物，{records.length} 条记录（{records.filter(r => r.photo).length} 张照片）</p>
        <p className="muted small">上次导出：{lastBackup ? fmtTime(lastBackup) : '从未导出'}</p>
        <button className="primary" onClick={onExport}>导出 JSON 备份</button>
        <button className="ghost" onClick={() => file.current?.click()}>从备份导入</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
        {msg && <p className="alert info">{msg}</p>}
      </section>
      <section className="panel">
        <h3>导出表格</h3>
        <p className="muted">导出后可用 Excel、WPS 或 Numbers 打开，方便排序、筛选、打印或转让时交给买家。表格只用于查看，不能用来恢复数据，备份请用上面的 JSON。</p>
        <button className="ghost" disabled={!pets.length} onClick={() => onExportSheet('xlsx')}>📊 导出 Excel（宠物 + 全部记录）</button>
        <button className="ghost" disabled={!records.length} onClick={() => onExportSheet('csv')}>导出 CSV（全部记录）</button>
        <p className="muted small">单只宠物的记录可在宠物详情页底部导出。照片不包含在表格中。</p>
      </section>
      <section className="panel">
        <h3>存储状态</h3>
        <p>持久化存储：{storage.persisted == null ? '浏览器不支持查询' : storage.persisted ? '✅ 已授予（浏览器不会自动清理）' : '⚠️ 未授予（空间不足或长期未打开时可能被清理）'}</p>
        <p className="muted small">已用 {mb(storage.usage)} / 可用约 {mb(storage.quota)}</p>
        {storage.persisted === false && <button className="ghost" onClick={requestPersist}>申请持久化存储</button>}
        <p className="muted small">iPhone 的 Safari 可能清除长期未访问网站的数据，建议添加到主屏幕使用，并定期导出备份。</p>
      </section>
      <section className="panel">
        <h3>安装到桌面</h3>
        <p className="muted">手机浏览器菜单中选择「添加到主屏幕」，即可像 App 一样离线使用。</p>
      </section>

      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div className="sheet form" onClick={e => e.stopPropagation()}>
            <h3>导入预览</h3>
            <p>宠物 {preview.pets.length} 只，记录 {preview.records.length} 条，照片 {preview.photos} 张</p>
            {preview.records.length > 0 && <p className="muted small">{countByType(preview.records)}</p>}
            {preview.range && <p className="muted small">记录时间：{new Date(preview.range[0]).toLocaleDateString('zh-CN')} – {new Date(preview.range[1]).toLocaleDateString('zh-CN')}</p>}
            {preview.overlap > 0 && <p className="alert warn">与现有数据重复 {preview.overlap} 项，合并时将以备份中的内容覆盖这些项</p>}
            {preview.skipped > 0 && <p className="alert info">有 {preview.skipped} 项无法识别，将被跳过</p>}
            <button className="primary" onClick={() => doImport(false)}>合并到现有数据</button>
            <button className="danger" onClick={() => doImport(true)}>覆盖现有数据（先自动下载当前数据快照）</button>
            <button className="ghost" onClick={() => setPreview(null)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
