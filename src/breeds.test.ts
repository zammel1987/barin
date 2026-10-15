import { describe, expect, it } from 'vitest'
import { BREED_GUIDES, findBreedGuide, searchBreedGuides } from './breeds'

describe('品种资料匹配与搜索', () => {
  it('旧档案的中文别名、学名、大小写与空格均可匹配', () => {
    expect(findBreedGuide('spider', ' gBb ')?.id).toBe('gbb')
    expect(findBreedGuide('spider', '厄紫')?.id).toBe('purple-pinktoe')
    expect(findBreedGuide('snake', 'Pantherophis guttatus')?.id).toBe('corn-snake')
    expect(findBreedGuide('mantis', '兰花螳')?.id).toBe('orchid-mantis')
  })
  it('只精确匹配物种内名称，不误认模糊名称或错误物种', () => {
    expect(findBreedGuide('snake', '王蛇')).toBeUndefined()
    expect(findBreedGuide('spider', '紫蜘蛛')).toBeUndefined()
    expect(findBreedGuide('mantis', 'GBB')).toBeUndefined()
    expect(findBreedGuide('spider', '')).toBeUndefined()
  })
  it('支持中文、学名、别名、习性标签搜索并与类别筛选叠加', () => {
    expect(searchBreedGuides('all', '树栖').map(b => b.id)).toContain('purple-pinktoe')
    expect(searchBreedGuides('snake', '树栖')).toHaveLength(0)
    expect(searchBreedGuides('all', 'pantherophis').map(b => b.id)).toEqual(['corn-snake'])
    expect(searchBreedGuides('all', '不存在')).toHaveLength(0)
  })
  it('每份资料名称唯一，且包含行为、照顾要点和可查来源', () => {
    expect(new Set(BREED_GUIDES.map(b => b.id)).size).toBe(BREED_GUIDES.length)
    for (const b of BREED_GUIDES) {
      expect(findBreedGuide(b.species, b.name)?.id).toBe(b.id)
      expect(b.behavior && b.housing && b.care).toBeTruthy()
      expect(b.sources.length).toBeGreaterThan(0)
      for (const source of b.sources) expect(new URL(source.url).protocol).toBe('https:')
    }
  })
})
