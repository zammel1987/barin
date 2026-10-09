// 导出为 Excel（.xlsx）或 CSV。只在点击导出时按需加载，不影响首屏
import { strToU8, zipSync } from 'fflate'
import { careIntervalFor, fmtAge, localDate, petStatus } from './logic'
import { ARCHIVE_REASONS, FEED_RESULTS, RECORD_TYPES, SPECIES, STAGES, type LogRecord, type Pet } from './types'

export type Cell = string | number | null | undefined
export interface Sheet { name: string; rows: Cell[][] }

const pad = (n: number) => String(n).padStart(2, '0')
const fmtDateTime = (t: number) => { const d = new Date(t); return `${localDate(t)} ${pad(d.getHours())}:${pad(d.getMinutes())}` }
const SEX = { male: '公', female: '母', unknown: '未知' }

export const PET_HEADER = ['名字', '物种', '品种', '性别', '入手日期', '出生/孵化日期', '状态', '阶段', '龄期', '年龄', '蜕皮次数', '当前喂食间隔(天)', '加水间隔(天)', '喷雾间隔(天)', '上次喂食', '上次蜕皮', '记录条数', '备注']
export const RECORD_HEADER = ['宠物', '物种', '日期', '时间', '类型', '食物', '数量', '进食情况', '剩饵', '吐食时间', '排便', '龄期', '蜕皮', '前期天数', '体重(g)', '备注', '照片']

export function petRows(pets: Pet[], records: LogRecord[], now = Date.now()): Cell[][] {
  return pets.map(p => {
    const s = petStatus(p, records, now)
    const g = s.g
    const status = p.archivedAt ? `已归档：${ARCHIVE_REASONS[p.archiveReason ?? 'other']} ${p.archivedAt}` : '在养'
    return [
      p.name, SPECIES[p.species].label, p.breed, SEX[p.sex], p.acquiredAt, p.hatchDate ?? '', status,
      g.stage ? STAGES[g.stage] : '', g.instar ?? null, g.ageDays != null ? `${g.estimated ? '约 ' : ''}${fmtAge(g.ageDays)}` : '',
      g.totalMolts, s.interval.days, careIntervalFor(p, 'water') || null, careIntervalFor(p, 'mist') || null,
      s.lastFeed ? fmtDateTime(s.lastFeed.at) : '', s.lastMolt ? fmtDateTime(s.lastMolt.at) : '', s.rs.length, p.notes,
    ]
  })
}

export function recordRows(pets: Pet[], records: LogRecord[]): Cell[][] {
  const byId = new Map(pets.map(p => [p.id, p]))
  return records
    .filter(r => byId.has(r.petId))
    .sort((a, b) => a.at - b.at)
    .map(r => {
      const p = byId.get(r.petId)!
      const d = new Date(r.at)
      return [
        p.name, SPECIES[p.species].label, localDate(r.at), `${pad(d.getHours())}:${pad(d.getMinutes())}`, RECORD_TYPES[r.type].label,
        r.food ?? '', r.quantity ?? null, r.feedResult ? FEED_RESULTS[r.feedResult] : '',
        r.preyLeft ? (r.preyRemovedAt ? '已取出' : '未取出') : '', r.feedResult === 'regurgitated' ? fmtDateTime(r.regurgAt ?? r.at) : '',
        r.type === 'poop' ? (r.poopNormal === false ? '异常' : '正常') : '', r.instar ?? null,
        r.type === 'molt' ? (r.moltComplete === false ? '不完整' : '完整') : '', r.premoltDays ?? null, r.weight ?? null,
        r.note, r.photo ? '有' : '',
      ]
    })
}

export function buildSheets(pets: Pet[], records: LogRecord[], now = Date.now()): Sheet[] {
  return [
    { name: '宠物', rows: [PET_HEADER, ...petRows(pets, records, now)] },
    { name: '记录', rows: [RECORD_HEADER, ...recordRows(pets, records)] },
  ]
}

// —— CSV ——
// 以 = + - @ 开头的文本加单引号，防止被表格软件当作公式执行
const csvCell = (v: Cell) => {
  if (v == null) return ''
  if (typeof v === 'number') return String(v)
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
// 带 UTF-8 BOM，Excel 打开中文不乱码
export const toCsv = (rows: Cell[][]) => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')

// —— XLSX（Office Open XML）——
// 去掉 XML 1.0 不允许的字符（控制字符、U+FFFE/U+FFFF、孤立的代理项），否则整个工作表无法打开
const XML_ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g
const xmlEscape = (s: string) => s
  .replace(XML_ILLEGAL, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const colName = (i: number) => { let s = ''; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s }
// Excel 单元格最多 32767 个字符，超出会提示文件损坏；截断时不拆开代理对
const CELL_MAX = 32767
const TRUNC_MARK = '…（已截断）'
export function capCell(s: string) {
  if (s.length <= CELL_MAX) return s
  let end = CELL_MAX - TRUNC_MARK.length
  if (/[\uD800-\uDBFF]/.test(s[end - 1])) end--
  return s.slice(0, end) + TRUNC_MARK
}
// 中日韩字符按 2 个宽度估算列宽
const textWidth = (v: Cell) => [...String(v ?? '')].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0)

function sheetXml(rows: Cell[][]) {
  const cols = rows[0].map((_, c) => Math.min(40, Math.max(6, ...rows.slice(0, 500).map(r => textWidth(r[c]))) + 2))
  const body = rows.map((r, ri) => {
    const cells = r.map((v, ci) => {
      if (v == null || v === '') return ''
      const ref = `${colName(ci)}${ri + 1}`
      const style = ri === 0 ? ' s="1"' : ''
      if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${style}><v>${v}</v></c>`
      return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(capCell(String(v)))}</t></is></c>`
    }).join('')
    return `<row r="${ri + 1}">${cells}</row>`
  }).join('')
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` +
    `<sheetData>${body}</sheetData></worksheet>`
}

const STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'

export function toXlsx(sheets: Sheet[]): Uint8Array {
  const ns = 'http://schemas.openxmlformats.org'
  const head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(head + `<Types xmlns="${ns}/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
      sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
      `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
    '_rels/.rels': strToU8(head + `<Relationships xmlns="${ns}/package/2006/relationships"><Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    'xl/workbook.xml': strToU8(head + `<workbook xmlns="${ns}/spreadsheetml/2006/main" xmlns:r="${ns}/officeDocument/2006/relationships"><sheets>` +
      sheets.map((s, i) => `<sheet name="${xmlEscape(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8(head + `<Relationships xmlns="${ns}/package/2006/relationships">` +
      sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${ns}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
      `<Relationship Id="rId${sheets.length + 1}" Type="${ns}/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    'xl/styles.xml': strToU8(STYLES),
  }
  sheets.forEach((s, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s.rows)) })
  return zipSync(files, { level: 6 })
}

function download(data: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  // 部分浏览器要求链接在页面中，download 文件名才会生效
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// 文件名里去掉不能用的字符
const safeName = (s: string) => s.replace(/[\\/:*?"<>|]/g, '_')

export function exportXlsx(pets: Pet[], records: LogRecord[], title = '爬宠记录') {
  download(toXlsx(buildSheets(pets, records)) as BlobPart, XLSX_TYPE, `${safeName(title)}-${localDate()}.xlsx`)
}

export function exportCsv(pets: Pet[], records: LogRecord[]) {
  download(toCsv([RECORD_HEADER, ...recordRows(pets, records)]), 'text/csv;charset=utf-8', `爬宠记录-${localDate()}.csv`)
}
