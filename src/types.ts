export type Species = 'mantis' | 'spider' | 'snake'
export type RecordType = 'feed' | 'poop' | 'water' | 'mist' | 'molt' | 'weight' | 'clean' | 'note'
export type FeedResult = 'eaten' | 'refused' | 'partial' | 'regurgitated'

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  sex: 'male' | 'female' | 'unknown'
  acquiredAt: string // YYYY-MM-DD
  feedInterval?: number // 旧版统一喂食间隔，已由 feedIntervals 取代，保留以兼容旧备份
  feedIntervals?: Partial<Record<Stage, number>> // 各阶段喂食间隔（天），未填则用物种默认值
  notes: string
  createdAt: number
  hatchDate?: string // 出生/孵化日期，可空
  initialMolts?: number // 入手时已蜕皮次数（节肢类）
  adultInstar?: number // 成体龄期（节肢类）
  initialAgeMonths?: number // 入手时大约月龄（蛇，不知道出生日期时用于估算）
  adultMonths?: number // 成体月龄（蛇）
  stageOverride?: Stage // 手动指定阶段
  premoltSince?: number // 手动标记的蜕皮前期（蛇为蓝眼期）开始时间，记录蜕皮后清除
  hardenDays?: number // 蜕皮后硬化期天数（节肢类），未填按物种和阶段默认
  acclimDays?: number // 到家适应期天数，未填按物种默认
  waterInterval?: number // 加水/换水间隔（天），0 为不提醒，未填按物种默认
  mistInterval?: number // 喷雾间隔（天），0 为不提醒，未填按物种默认
  archivedAt?: string // 归档日期（死亡/转让），归档后不再提醒
  archiveReason?: ArchiveReason
  archiveNote?: string
}

export type ArchiveReason = 'dead' | 'rehomed' | 'other'
export const ARCHIVE_REASONS: Record<ArchiveReason, string> = { dead: '死亡', rehomed: '转让', other: '其他' }

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
  preyLeft?: boolean // 拒食/吃剩时活饵或残渣仍在缸内
  preyRemovedAt?: number // 剩饵取出时间
  regurgAt?: number // 吐食时间（蛇），未填按喂食时间
  premoltDays?: number // 本次蜕皮前期天数（由手动标记的蜕皮前期算出）
}

// moltDays: 平均蜕皮间隔（估算年龄、无历史时的蜕皮参考）；adultInstar: 默认成体龄期（L1 为孵化时）
// harden: 蜕皮后硬化期（天，按蜕皮后所处阶段）；acclimDays: 到家适应期（天）
interface SpeciesInfo {
  label: string; emoji: string; intervals: Record<Stage, number>; foods: string[]
  moltDays: number; adultInstar: number; adultMonths: number
  harden: Record<Stage, number>; acclimDays: number; premoltName: string
  water: number; mist: number // 默认加水/喷雾间隔（天），0 为默认不提醒
}
export const SPECIES: Record<Species, SpeciesInfo> = {
  mantis: { label: '螳螂', emoji: '🦗', intervals: { nymph: 2, subadult: 3, adult: 4 }, foods: ['果蝇', '蟋蟀', '蝗虫', '苍蝇', '蟑螂'], moltDays: 12, adultInstar: 8, adultMonths: 0, harden: { nymph: 1, subadult: 1, adult: 2 }, acclimDays: 1, premoltName: '蜕皮前期', water: 0, mist: 2 },
  spider: { label: '蜘蛛', emoji: '🕷️', intervals: { nymph: 4, subadult: 7, adult: 14 }, foods: ['蟋蟀', '杜比亚', '面包虫', '大麦虫', '樱桃红蟑螂'], moltDays: 45, adultInstar: 10, adultMonths: 0, harden: { nymph: 5, subadult: 7, adult: 12 }, acclimDays: 3, premoltName: '蜕皮前期', water: 7, mist: 0 },
  snake: { label: '蛇', emoji: '🐍', intervals: { nymph: 7, subadult: 10, adult: 14 }, foods: ['乳鼠', '跳鼠', '成鼠', '冻鼠', '小鸡'], moltDays: 0, adultInstar: 0, adultMonths: 24, harden: { nymph: 0, subadult: 0, adult: 0 }, acclimDays: 7, premoltName: '蓝眼期', water: 7, mist: 0 },
}

export const RECORD_TYPES: Record<RecordType, { label: string; emoji: string }> = {
  feed: { label: '喂食', emoji: '🍽️' },
  poop: { label: '排便', emoji: '💩' },
  water: { label: '加水/换水', emoji: '💧' },
  mist: { label: '喷雾', emoji: '💦' },
  molt: { label: '蜕皮', emoji: '🔄' },
  weight: { label: '体重', emoji: '⚖️' },
  clean: { label: '清洁', emoji: '🧽' },
  note: { label: '备注', emoji: '📝' },
}

export const FEED_RESULTS: Record<FeedResult, string> = { eaten: '已吃', refused: '拒食', partial: '吃剩', regurgitated: '吐食' }
