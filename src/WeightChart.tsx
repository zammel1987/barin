export default function WeightChart({ points }: { points: { t: number; v: number }[] }) {
  const W = 320, H = 140, P = 28
  const ts = points.map(p => p.t), vs = points.map(p => p.v)
  const [t0, t1] = [Math.min(...ts), Math.max(...ts)]
  const [v0, v1] = [Math.min(...vs), Math.max(...vs)]
  const x = (t: number) => P + ((t - t0) / (t1 - t0 || 1)) * (W - 2 * P)
  const y = (v: number) => H - P + 8 - ((v - v0) / (v1 - v0 || 1)) * (H - 2 * P)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.t)},${y(p.v)}`).join(' ')
  const fmt = (t: number) => new Date(t).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="体重折线图">
      <line x1={P} x2={W - P} y1={H - P + 8} y2={H - P + 8} className="axis" />
      <path d={d} className="line" />
      {points.map(p => <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={3.5} className="dot"><title>{fmt(p.t)}：{p.v} g</title></circle>)}
      <text x={P} y={14} className="lbl">{v1} g</text>
      <text x={P} y={H - P + 22} className="lbl">{fmt(t0)}</text>
      <text x={W - P} y={H - P + 22} className="lbl" textAnchor="end">{fmt(t1)}</text>
    </svg>
  )
}
