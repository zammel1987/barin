import { BREED_REVIEWED_AT, type BreedGuide } from './breeds'
import { SPECIES } from './types'

export default function BreedCard({ guide, compact = false }: { guide: BreedGuide; compact?: boolean }) {
  const identification = guide.identification && <p className="breed-caution" role="note">🔎 {guide.identification}</p>
  return (
    <article className={`panel breed-card ${compact ? 'compact' : ''}`}>
      <div className="row">
        <div className="avatar" aria-hidden="true">{SPECIES[guide.species].emoji}</div>
        <div className="grow"><h3>{guide.name}</h3><p className="breed-latin">{guide.scientificName}</p></div>
      </div>
      <div className="breed-tags">{guide.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <p className="breed-summary">{guide.summary}</p>
      {!compact && identification}
      <dl className="breed-facts">
        <div><dt>栖居方式</dt><dd>{guide.habitat}</dd></div>
        <div><dt>活动习惯</dt><dd>{guide.activity}</dd></div>
        <div><dt>主要食物</dt><dd>{guide.diet}</dd></div>
      </dl>
      <details className="breed-more" open={compact ? undefined : true}>
        <summary>习性与饲养要点</summary>
        {compact && identification}
        <dl className="breed-notes">
          <div><dt>原生分布</dt><dd>{guide.origin}</dd></div>
          <div><dt>性格与行为</dt><dd>{guide.behavior}</dd></div>
          <div><dt>环境布置</dt><dd>{guide.housing}</dd></div>
          <div><dt>日常照顾</dt><dd>{guide.care}</dd></div>
        </dl>
        <p className="breed-caution">💡 {guide.caution}</p>
        <p className="muted small">资料供了解品种，个体会有差异；喂食及护理间隔仍以你的设置为准。</p>
        <div className="breed-sources">
          <span className="muted small">参考资料 · 核对于 {BREED_REVIEWED_AT}（原文需联网）</span>
          {guide.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>)}
        </div>
      </details>
    </article>
  )
}
