import type { Chart2Element } from "@/data/types";

/** Deux séries de barres, flèche bleue courbe avec un mot en capitales. */
export function Chart2({ el }: { el: Chart2Element }) {
  const W = 340;
  const H = 180;
  const n = el.series[0]?.values.length ?? 0;
  const groupW = (W - 20) / n;
  const bw = (groupW - 10) / el.series.length;
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-white p-3 shadow-soft">
      <div className="px-1 pb-1 text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={0} x2={W} y1={H - 20 - (H - 44) * t} y2={H - 20 - (H - 44) * t} stroke="#f0f0ee" />
        ))}
        {el.series.map((s, si) =>
          s.values.map((v, i) => {
            const h = (H - 44) * v;
            const x = 10 + i * groupW + 5 + si * bw;
            return <rect key={`${si}-${i}`} x={x} y={H - 20 - h} width={bw - 2} height={h} rx={2} fill={s.color} />;
          }),
        )}
        <line x1={0} x2={W} y1={H - 20} y2={H - 20} stroke="#d6d6d3" />
        <defs>
          <marker id={`head-${el.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#2F6FE4" />
          </marker>
          <path id={`curve-${el.id}`} d={`M 14 ${H - 30 - (H - 44) * (el.series[0]?.values[0] ?? 0.5)} C ${W * 0.35} ${H * 0.02}, ${W * 0.6} ${H * 0.08}, ${W - 14} ${H - 32 - (H - 44) * (el.series[1]?.values[n - 1] ?? 0.5)}`} />
        </defs>
        <use href={`#curve-${el.id}`} stroke="#2F6FE4" strokeWidth={2.5} fill="none" markerEnd={`url(#head-${el.id})`} />
        <text fontSize={11} fontWeight={700} fill="#2F6FE4" letterSpacing={2}>
          <textPath href={`#curve-${el.id}`} startOffset="30%">{el.word}</textPath>
        </text>
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 px-1 text-[11px] text-[#6b6b70]">
        {el.series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
