import { useState } from 'react'
import BreedCard from './BreedCard'
import { searchBreedGuides } from './breeds'
import { SPECIES, type Species } from './types'

export default function BreedLibrary({ initialSpecies = 'all' }: { initialSpecies?: Species | 'all' }) {
  const [species, setSpecies] = useState<Species | 'all'>(initialSpecies)
  const [query, setQuery] = useState('')
  const guides = searchBreedGuides(species, query)
  return (
    <div className="breed-library">
      <p className="muted">认识它的特点、习性，找到适合它的饲养方式。</p>
      <label className="breed-search">搜索品种
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="中文名、学名、GBB 或树栖…" />
      </label>
      <div className="chips">
        <button className={species === 'all' ? 'on' : ''} onClick={() => setSpecies('all')}>全部</button>
        {(Object.keys(SPECIES) as Species[]).map(s => <button key={s} className={species === s ? 'on' : ''} onClick={() => setSpecies(s)}>{SPECIES[s].emoji} {SPECIES[s].label}</button>)}
      </div>
      <p className="muted small" role="status">找到 {guides.length} 种 · 内置资料可离线查看</p>
      {!guides.length && <p className="empty">暂未收录这个品种。可以换个名称搜索；添加宠物时仍可自行填写品种。</p>}
      {guides.map(guide => <BreedCard key={guide.id} guide={guide} />)}
    </div>
  )
}
