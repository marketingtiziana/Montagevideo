import type { Geometry, PathItem } from "@/lib/geometry";
import { NOTE_BG } from "@/lib/geometry";
import { BOARD_WIDTH } from "@/lib/layout";

function Paths({ items }: { items: PathItem[] }) {
  return (
    <>
      {items.map((p) => (
        <path key={p.key} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? "none"} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </>
  );
}

/** Couche arrière : trait central, noeuds, branches et étiquettes. */
export function DecorBack({ geom }: { geom: Geometry | null }) {
  if (!geom) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <svg width={BOARD_WIDTH} height={geom.height} viewBox={`0 0 ${BOARD_WIDTH} ${geom.height}`} className="absolute left-0 top-0">
        <Paths items={geom.back} />
      </svg>
    </div>
  );
}

/** Couche avant : annotations (cercles, soulignements, flèches) et notes manuscrites. */
export function DecorFront({ geom, noteArrows }: { geom: Geometry | null; noteArrows: PathItem[] }) {
  if (!geom) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {geom.labels.map((l) => (
        <span
          key={l.key}
          className="absolute whitespace-nowrap rounded-full border-2 bg-white px-3 py-0.5 text-[22px] font-bold leading-tight shadow-sm"
          style={{
            left: l.x,
            top: l.y,
            transform: `translate(-50%, -50%) rotate(${l.rotate}deg)`,
            borderColor: l.color,
            color: l.color,
          }}
        >
          {l.text}
        </span>
      ))}
      {geom.notes.map((n) => (
        <div
          key={n.key}
          data-note={n.key}
          className="absolute rounded-xl px-4 py-2.5 text-[22px] font-semibold leading-snug text-navy shadow-soft"
          style={{
            left: n.x,
            top: n.y,
            width: n.width,
            background: NOTE_BG[n.tone],
            transform: `${n.translate} rotate(${n.rotate}deg)`,
            transformOrigin: "center",
          }}
        >
          {n.text}
        </div>
      ))}
      <svg width={BOARD_WIDTH} height={geom.height} viewBox={`0 0 ${BOARD_WIDTH} ${geom.height}`} className="absolute left-0 top-0">
        <Paths items={geom.front} />
        <Paths items={noteArrows} />
      </svg>
    </div>
  );
}
