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
  it('新增螳螂支持用户提供的中英文名称，幽灵旧档案仍然匹配', () => {
    for (const name of ['芽翅螳螂', 'Budwing mantis', '芽翅螳螂（Budwing mantis）']) {
      expect(findBreedGuide('mantis', name)?.id).toBe('budwing-mantis')
    }
    for (const name of ['非洲树枝螳螂', 'African twig mantis', 'Popa spurca']) {
      expect(findBreedGuide('mantis', name)?.id).toBe('african-twig-mantis')
    }
    for (const name of ['高冠幽灵螳螂', '幽灵螳螂', 'Ghost Mantis', 'Phyllocrania paradoxa', '高冠幽灵螳螂Phyllocrania paradoxa']) {
      expect(findBreedGuide('mantis', name)?.id).toBe('ghost-mantis')
    }
  })
  it('芽翅俗名只确认到属，不把近似种拉丁名当成同一种的别名', () => {
    const guide = findBreedGuide('mantis', 'Budwing mantis')!
    expect(guide.scientificName).toBe('Parasphendale sp.')
    expect(guide.identification).toContain('具体种名需核对')
    expect(findBreedGuide('mantis', 'Parasphendale affinis')).toBeUndefined()
    expect(findBreedGuide('mantis', 'Parasphendale agrionina')).toBeUndefined()
    expect(findBreedGuide('snake', 'African twig mantis')).toBeUndefined()
    expect(searchBreedGuides('mantis', '种级待确认').map(b => b.id)).toEqual(['budwing-mantis'])
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
  it('弑菱背螳及旧中文别名对应 fratricida，与 basalis 独立匹配', () => {
    expect(findBreedGuide('mantis', 'Rhombodera basalis')?.id).toBe('rhombodera-basalis')
    expect(findBreedGuide('mantis', '基菱背螳')?.id).toBe('rhombodera-basalis')
    for (const name of ['弑菱背螳', '弑亲菱背螳', '弑亲菱斧螳', '夺嫡菱背螳', 'Rhombodera fratricida', '弑菱背螳Rhombodera fratricida']) {
      const guide = findBreedGuide('mantis', name)!
      expect(guide.id).toBe('rhombodera-fratricida')
      expect(guide.name).toBe('弑菱背螳')
      expect(guide.scientificName).toBe('Rhombodera fratricida')
    }
    expect(searchBreedGuides('mantis', '弑亲菱背螳').map(b => b.id)).toEqual(['rhombodera-fratricida'])
    expect(findBreedGuide('spider', 'Rhombodera fratricida')).toBeUndefined()
  })
  it('宠物档案中的“弑亲棱背螳螂”及完整中文写法可直接匹配 RF', () => {
    for (const name of ['弑亲棱背螳螂', '弑亲菱背螳螂', '弑亲棱背螳', '弑亲棱背螳螂（Rhombodera fratricida）']) {
      expect(findBreedGuide('mantis', name)?.scientificName).toBe('Rhombodera fratricida')
      expect(searchBreedGuides('mantis', name).map(b => b.id)).toEqual(['rhombodera-fratricida'])
    }
  })
})
