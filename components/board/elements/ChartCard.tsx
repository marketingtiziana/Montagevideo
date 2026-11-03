'use client';

import type { ChartElement } from '@/data/board';
import { useBoard } from '@/components/board/BoardContext';
import { roughArrowPaths, roughCurvePaths } from '@/lib/rough';
import { hashSeed } from '@/lib/random';
import Shell from './Shell';

/** Deux séries de barres sans valeurs, et une flèche bleue courbe avec un mot écrit le long. */
export default function ChartCard({ el }: { el: ChartElement }) {
  const board = useBoard();
  const W = 340;
  const H = 210;
  const padL = 18;
  const padB = 34;
  const padT = 22;
  const n = Math.max(...el.series.map((s) => s.values.length));
  const groupW = (W - padL - 14) / n;
  const barW = Math.min(22, (groupW - 10) / el.series.length);
  const chartH = H - padT - padB;
  const toneColor = (t: 'red' | 'green') => (t === 'red' ? board.lines.left.color : board.lines.right.color);

  const arrowPathId = `arrow-${el.id}`;
  const d = `M ${padL + 10} ${padT + chartH - 10} Q ${W / 2} ${padT + chartH - 40} ${W - 28} ${padT + 14}`;
  const arrowCurve = roughCurvePaths(d, { seed: hashSeed(el.id), stroke: board.arrowColor, strokeWidth: 2.6, roughness: 1 });
  const arrowHead = roughArrowPaths(W - 28, padT + 14, Math.atan2(padT + 14 - (padT + chartH - 40), W - 28 - W / 2), {
    seed: hashSeed(`${el.id}-head`),
    stroke: board.arrowColor,
    strokeWidth: 2.6,
    size: 11,
  });

  return (
    <Shell width={el.width} overlays={el.overlays}>
      <div className="px-3 pb-2 pt-3">
        {el.title && <p className="px-1 pb-1 text-[13px] font-black tracking-tight text-[#111827]">{el.title}</p>}
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={el.series.map((s) => s.label).join(' / ')}>
          <line x1={padL} y1={padT + chartH} x2={W - 10} y2={padT + chartH} stroke="#D1D5DB" strokeWidth={1} />
          {Array.from({ length: n }).map((_, i) =>
            el.series.map((s, j) => {
              const v = s.values[i] ?? 0;
              const h = Math.max(4, v * chartH);
              const x = padL + i * groupW + 6 + j * (barW + 4);
              return (
                <rect key={`${i}-${j}`} x={x} y={padT + chartH - h} width={barW} height={h} rx={4} fill={toneColor(s.tone)} opacity={0.85} />
              );
            }),
          )}
          <defs>
            <path id={arrowPathId} d={d} />
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {arrowCurve.map((p, i) => (
              <path key={`c${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} />
            ))}
            {arrowHead.map((p, i) => (
              <path key={`h${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} />
            ))}
          </g>
          {el.arrowWord && (
            <text fontSize={18} fontWeight={900} fill={board.arrowColor} letterSpacing="0.22em" dy={-9}>
              <textPath href={`#${arrowPathId}`} startOffset="46%" textAnchor="middle">
                {el.arrowWord}
              </textPath>
            </text>
          )}
          {el.series.map((s, j) => (
            <g key={s.label} transform={`translate(${padL + j * 150} ${H - 10})`}>
              <rect x={0} y={-9} width={10} height={10} rx={2} fill={toneColor(s.tone)} />
              <text x={15} y={0} fontSize={11} fontWeight={600} fill="#374151">
                {s.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Shell>
  );
}
