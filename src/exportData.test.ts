import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { buildSheets, colName, PET_HEADER, RECORD_HEADER, recordRows, toCsv, toXlsx } from './exportData'
import type { LogRecord, Pet } from './types'

const NOW = new Date(2026, 9, 9, 10, 0).getTime()
const pet: Pet = { id: 'p1', name: '红玫瑰', species: 'spider', breed: '智利红玫瑰', sex: 'female', acquiredAt: '2026-01-01', notes: '', createdAt: NOW }
const recs: LogRecord[] = [
  { id: 'r2', petId: 'p1', type: 'molt', at: new Date(2026, 8, 1, 21, 5).getTime(), note: '', instar: 6, moltComplete: false },
  { id: 'r1', petId: 'p1', type: 'feed', at: new Date(2026, 7, 1, 8, 0).getTime(), note: '=1+1 "引号", 逗号\n换行', food: '杜比亚', quantity: 2, feedResult: 'refused', preyLeft: true },
  { id: 'r3', petId: 'other', type: 'feed', at: NOW, note: '' },
]

describe('表格行', () => {
  it('记录按时间排序，过滤掉不属于导出宠物的记录', () => {
    const rows = recordRows([pet], recs)
    expect(rows).toHaveLength(2)
    expect(rows[0].slice(0, 9)).toEqual(['红玫瑰', '蜘蛛', '2026-08-01', '08:00', '喂食', '杜比亚', 2, '拒食', '未取出'])
    expect(rows[1][12]).toBe('不完整')
    expect(rows[1][11]).toBe(6)
  })
  it('表头与列数一致', () => {
    const [pets, records] = buildSheets([pet], recs, NOW)
    expect(pets.rows[0]).toEqual(PET_HEADER)
    expect(pets.rows[1]).toHaveLength(PET_HEADER.length)
    expect(records.rows.every(r => r.length === RECORD_HEADER.length)).toBe(true)
  })
})

describe('CSV', () => {
  it('带 BOM、转义引号/逗号/换行，并防止公式注入', () => {
    const csv = toCsv([['a', 1], ['=1+1 "引号", 逗号\n换行', null]])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain(`"'=1+1 ""引号"", 逗号\n换行",`)
    expect(csv.split('\r\n')[0]).toBe('﻿a,1')
  })
})

describe('XLSX', () => {
  it('列名', () => {
    expect([0, 25, 26, 27, 701, 702].map(colName)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ', 'AAA'])
  })
  it('生成合法的 zip，包含两个工作表，数字为数值、文本已转义', () => {
    const files = unzipSync(toXlsx(buildSheets([pet], recs, NOW)))
    expect(Object.keys(files).sort()).toEqual(['[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml'])
    const wb = strFromU8(files['xl/workbook.xml'])
    expect(wb).toContain('name="宠物"')
    expect(wb).toContain('name="记录"')
    const sheet2 = strFromU8(files['xl/worksheets/sheet2.xml'])
    expect(sheet2).toContain('<c r="G2"><v>2</v></c>')
    expect(sheet2).toContain('=1+1 &quot;引号&quot;, 逗号\n换行')
    expect(sheet2).not.toMatch(/[\u0000-\u0008]/)
  })
})
