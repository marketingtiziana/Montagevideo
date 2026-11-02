import rough from "roughjs/bin/rough";
import type { ScribbleElement } from "@/data/types";
import { rngFor } from "@/lib/rng";

const gen = rough.generator();

/** Annotation à la main : cercle, grosse flèche ou gribouillis. Désactivé par défaut. */
export function Scribble({ el }: { el: ScribbleElement }) {
  const seed = (rngFor(`scribble/${el.id}`).seed % 2147483646) + 1;
  const w = el.w;
  const h = el.h;
  let drawables: ReturnType<typeof gen.line>[] = [];
  if (el.kind === "circle") {
    drawables = [gen.ellipse(w / 2, h / 2, w - 8, h - 8, { stroke: el.color, strokeWidth: 4, roughness: 2.2, seed })];
  } else if (el.kind === "arrow") {
    drawables = [
      gen.line(6, h / 2, w - 10, h / 2, { stroke: el.color, strokeWidth: 10, roughness: 1.6, seed }),
      gen.line(w - 10, h / 2, w - 40, h / 2 - 28, { stroke: el.color, strokeWidth: 10, roughness: 1.6, seed: seed + 1 }),
      gen.line(w - 10, h / 2, w - 40, h / 2 + 28, { stroke: el.color, strokeWidth: 10, roughness: 1.6, seed: seed + 2 }),
    ];
  } else {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) pts.push([6 + ((w - 12) * i) / 12, h / 2 + (i % 2 === 0 ? -h / 3 : h / 3)]);
    drawables = [gen.curve(pts, { stroke: el.color, strokeWidth: 4, roughness: 2.5, seed })];
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none" aria-hidden>
      {drawables.flatMap((d, i) =>
        gen.toPaths(d).map((p, j) => <path key={`${i}-${j}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />),
      )}
    </svg>
  );
}
