import type { WorldmapElement } from "@/data/types";

/**
 * Carte du monde simplifiée : continents en traits fins gris, pins ronds.
 * Projection équirectangulaire, contours volontairement grossiers.
 */
const W = 420;
const H = 210;
const x = (lon: number) => ((lon + 180) / 360) * W;
const y = (lat: number) => ((90 - lat) / 180) * H;

const CONTINENTS: [number, number][][] = [
  [[72, -168], [70, -95], [60, -65], [47, -52], [25, -80], [15, -88], [8, -78], [20, -105], [32, -117], [49, -125], [60, -140]],
  [[83, -40], [76, -20], [60, -44], [70, -55]],
  [[12, -72], [5, -50], [-5, -35], [-23, -41], [-35, -56], [-55, -68], [-45, -75], [-18, -71], [0, -80]],
  [[71, 25], [60, 30], [45, 40], [41, 28], [36, -6], [43, -9], [48, -5], [58, -8], [62, 5]],
  [[37, -6], [32, 32], [12, 43], [-2, 41], [-35, 20], [-34, 18], [-17, 12], [5, 9], [15, -17], [35, -10]],
  [[72, 30], [76, 100], [70, 170], [60, 160], [50, 140], [35, 122], [22, 108], [10, 105], [1, 103], [8, 78], [23, 68], [25, 57], [33, 35], [41, 28], [45, 40], [60, 30]],
  [[-12, 131], [-20, 148], [-38, 148], [-35, 117], [-22, 114]],
];

export function Worldmap({ el }: { el: WorldmapElement }) {
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-white p-3 shadow-soft">
      {el.title && <div className="px-1 pb-2 text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          <rect x={0} y={0} width={W} height={H} rx={6} fill="#fafafa" />
          {CONTINENTS.map((poly, i) => (
            <polygon key={i} points={poly.map(([la, lo]) => `${x(lo).toFixed(1)},${y(la).toFixed(1)}`).join(" ")} fill="#f1f1ef" stroke="#c9c9c5" strokeWidth={1} strokeLinejoin="round" />
          ))}
          {el.pins.map((p, i) => (
            <g key={i}>
              <circle cx={x(p.lon)} cy={y(p.lat)} r={9} fill={p.color} opacity={0.18} />
              <circle cx={x(p.lon)} cy={y(p.lat)} r={4.5} fill={p.color} stroke="#fff" strokeWidth={1.5} />
              {p.label && (
                <text x={x(p.lon) + 8} y={y(p.lat) - 6} fontSize={9} fontWeight={700} fill={p.color}>
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
        {el.pins
          .filter((p) => p.stack)
          .map((p, i) => (
            <div key={i} className="absolute flex flex-col" style={{ left: `${(x(p.lon) / W) * 100}%`, top: `${(y(p.lat) / H) * 100}%`, transform: "translate(12px, -110%)" }}>
              {p.stack!.map((s, j) => (
                <span key={j} className="whitespace-nowrap rounded-md border bg-white px-2 py-0.5 text-[11px] font-semibold shadow-sm" style={{ borderColor: p.color, color: p.color, marginTop: j === 0 ? 0 : -2, marginLeft: j * 6 }}>
                  {s}
                </span>
              ))}
            </div>
          ))}
      </div>
      {el.legend && <div className="px-1 pt-2 text-[11px] text-[#6b6b70]">{el.legend}</div>}
    </div>
  );
}
