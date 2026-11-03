import type { ChartElement } from "@/data/types";

/** Barres orange décroissantes, flèche courbe bleue avec un mot en capitales. */
export function Chart({ el }: { el: ChartElement }) {
  const W = 320;
  const H = 180;
  const n = el.bars.length;
  const gap = 10;
  const bw = (W - gap * (n + 1)) / n;
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-white p-3 shadow-soft">
      <div className="px-1 pb-1 text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={0} x2={W} y1={H - 20 - (H - 40) * t} y2={H - 20 - (H - 40) * t} stroke="#f0f0ee" />
        ))}
        {el.bars.map((v, i) => {
          const h = (H - 40) * v;
          return <rect key={i} x={gap + i * (bw + gap)} y={H - 20 - h} width={bw} height={h} rx={3} fill="#f28b3b" />;
        })}
        <line x1={0} x2={W} y1={H - 20} y2={H - 20} stroke="#d6d6d3" />
        <defs>
          <marker id={`head-${el.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#2F6FE4" />
          </marker>
          <path id={`curve-${el.id}`} d={`M ${gap} ${H - 40 - (H - 40) * el.bars[0] + 10} C ${W * 0.35} ${H * 0.05}, ${W * 0.65} ${H * 0.35}, ${W - gap} ${H - 24 - (H - 40) * el.bars[n - 1]}`} />
        </defs>
        <use href={`#curve-${el.id}`} stroke="#2F6FE4" strokeWidth={2.5} fill="none" markerEnd={`url(#head-${el.id})`} />
        <text fontSize={11} fontWeight={700} fill="#2F6FE4" letterSpacing={2}>
          <textPath href={`#curve-${el.id}`} startOffset="22%">{el.word}</textPath>
        </text>
      </svg>
      {el.legend && <div className="px-1 pt-1 text-[11.5px] leading-snug text-[#6b6b70]">{el.legend}</div>}
    </div>
  );
}
