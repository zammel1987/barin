import { makeBackup } from './db'
import { DAY, localDate } from './logic'
import type { LogRecord, Pet } from './types'

// localStorage 可能不可用（隐私模式等），读写都要兜底
const read = (k: string) => { try { const v = localStorage.getItem(k); return v ? Number(v) : null } catch { return null } }
const write = (k: string, v: number) => { try { localStorage.setItem(k, String(v)) } catch { /* 忽略 */ } }

export const getLastBackup = () => read('lastBackupAt')
export const dismissBackupReminder = () => write('backupReminderDismissedAt', Date.now())

export function downloadBackup(pets: Pet[], records: LogRecord[], prefix = '爬宠记录备份') {
  const url = URL.createObjectURL(new Blob([JSON.stringify(makeBackup(pets, records), null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${prefix}-${localDate()}.json`
  a.click()
  // 留足时间给浏览器的下载确认（iOS 会先弹窗）
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export function exportBackup(pets: Pet[], records: LogRecord[]) {
  downloadBackup(pets, records)
  write('lastBackupAt', Date.now())
}

// 备份提醒：上次备份超过 14 天且有新内容；从未备份则在有 7 天前的数据时提醒。关闭后 3 天内不再出现
export function backupReminder(pets: Pet[], records: LogRecord[], now = Date.now()) {
  const dismissed = read('backupReminderDismissedAt')
  if (dismissed && now - dismissed < 3 * DAY) return null
  const last = getLastBackup()
  if (last) {
    const fresh = records.filter(r => r.at > last).length + pets.filter(p => p.createdAt > last).length
    const days = Math.floor((now - last) / DAY)
    return days > 14 && fresh > 0 ? { days, fresh, never: false } : null
  }
  const oldest = Math.min(...pets.map(p => p.createdAt), ...records.map(r => r.at))
  return Number.isFinite(oldest) && now - oldest >= 7 * DAY ? { days: Math.floor((now - oldest) / DAY), fresh: records.length, never: true } : null
}
