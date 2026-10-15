import { useState } from 'react'
import BreedCard from './BreedCard'
import { BREED_GUIDES, searchBreedGuides } from './breeds'
import { SPECIES, type Species } from './types'

export default function BreedLibrary({ initialSpecies = 'all', breedId, onOpen }: {
  initialSpecies?: Species | 'all'; breedId?: string; onOpen: (id: string) => void
}) {
  const [species, setSpecies] = useState<Species | 'all'>(initialSpecies)
  const [query, setQuery] = useState('')
  const guides = searchBreedGuides(species, query)
  // 详情只按具体品种 ID 取一份资料，不按“螳螂”等大类展开。
  if (breedId) {
    const guide = BREED_GUIDES.find(b => b.id === breedId)
    return guide ? <BreedCard key={guide.id} guide={guide} /> : <p className="empty">未找到该品种资料，请返回重新选择。</p>
  }
  return (
    <div className="breed-library">
      <p className="muted">选择一个品种，单独查看它的特点、习性和饲养要点。</p>
      <label className="breed-search">搜索品种
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="中文名、学名、GBB 或树栖…" />
      </label>
      <div className="chips">
        <button className={species === 'all' ? 'on' : ''} onClick={() => setSpecies('all')}>全部</button>
        {(Object.keys(SPECIES) as Species[]).map(s => <button key={s} className={species === s ? 'on' : ''} onClick={() => setSpecies(s)}>{SPECIES[s].emoji} {SPECIES[s].label}</button>)}
      </div>
      <p className="muted small" role="status">找到 {guides.length} 份资料 · 点击品种查看 · 可离线使用</p>
      {!guides.length && <p className="empty">暂未收录这个品种。可以换个名称搜索；添加宠物时仍可自行填写品种。</p>}
      <div className="breed-choices">
        {guides.map(guide => (
          <button key={guide.id} className="breed-choice" onClick={() => onOpen(guide.id)} aria-label={`查看${guide.name}图鉴`}>
            <span className="avatar" aria-hidden="true">{SPECIES[guide.species].emoji}</span>
            <span className="grow"><b>{guide.name}</b><span className="breed-latin">{guide.scientificName}</span></span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
