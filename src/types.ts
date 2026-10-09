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
  hatchDate?: string // 出生/孵化日期，可空
  initialMolts?: number // 入手时已蜕皮次数（节肢类）
  adultInstar?: number // 成体龄期
  stageOverride?: Stage // 手动指定阶段
}

export type Stage = 'nymph' | 'subadult' | 'adult'
export const STAGES: Record<Stage, string> = { nymph: '幼体', subadult: '亚成', adult: '成体' }

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
  photo?: string // 压缩后的 JPEG dataURL
}

// moltDays: 估算年龄用的平均蜕皮间隔；adultInstar: 默认成体龄期（L1 为孵化时）
export const SPECIES: Record<Species, { label: string; emoji: string; interval: number; foods: string[]; moltDays: number; adultInstar: number }> = {
  mantis: { label: '螳螂', emoji: '🦗', interval: 2, foods: ['果蝇', '蟋蟀', '蝗虫', '苍蝇', '蟑螂'], moltDays: 12, adultInstar: 8 },
  spider: { label: '蜘蛛', emoji: '🕷️', interval: 7, foods: ['蟋蟀', '杜比亚', '面包虫', '大麦虫', '樱桃红蟑螂'], moltDays: 45, adultInstar: 10 },
  snake: { label: '蛇', emoji: '🐍', interval: 10, foods: ['乳鼠', '跳鼠', '成鼠', '冻鼠', '小鸡'], moltDays: 0, adultInstar: 0 },
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
