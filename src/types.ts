export type Species = 'mantis' | 'spider' | 'snake'
export type RecordType = 'feed' | 'poop' | 'molt' | 'weight' | 'clean' | 'note'
export type FeedResult = 'eaten' | 'refused' | 'partial'

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  sex: 'male' | 'female' | 'unknown'
  acquiredAt: string // YYYY-MM-DD
  feedInterval: number // 天
  notes: string
  createdAt: number
}

export interface LogRecord {
  id: string
  petId: string
  type: RecordType
  at: number // 时间戳
  note: string
  food?: string
  quantity?: number
  feedResult?: FeedResult
  poopNormal?: boolean
  instar?: number
  moltComplete?: boolean
  weight?: number // 克
}

export const SPECIES: Record<Species, { label: string; emoji: string; interval: number; foods: string[] }> = {
  mantis: { label: '螳螂', emoji: '🦗', interval: 2, foods: ['果蝇', '蟋蟀', '蝗虫', '苍蝇', '蟑螂'] },
  spider: { label: '蜘蛛', emoji: '🕷️', interval: 7, foods: ['蟋蟀', '杜比亚', '面包虫', '大麦虫', '樱桃红蟑螂'] },
  snake: { label: '蛇', emoji: '🐍', interval: 10, foods: ['乳鼠', '跳鼠', '成鼠', '冻鼠', '小鸡'] },
}

export const RECORD_TYPES: Record<RecordType, { label: string; emoji: string }> = {
  feed: { label: '喂食', emoji: '🍽️' },
  poop: { label: '排便', emoji: '💩' },
  molt: { label: '蜕皮', emoji: '🔄' },
  weight: { label: '体重', emoji: '⚖️' },
  clean: { label: '换水/清洁', emoji: '💧' },
  note: { label: '备注', emoji: '📝' },
}

export const FEED_RESULTS: Record<FeedResult, string> = { eaten: '已吃', refused: '拒食', partial: '吃剩' }
