import rough from "roughjs/bin/rough";
import type { BoardData, Link } from "@/data/board169-types";
import { rngFor } from "./rng";

export const FRAME_W = 1920;
export const FRAME_H = 1080;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Pt {
  x: number;
  y: number;
}

export interface PathItem {
  key: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface LinkLabel {
  key: string;
  x: number;
  y: number;
  text: string;
  color: string;
  rotate: number;
}

export interface LinkGeometry {
  paths: PathItem[];
  labels: LinkLabel[];
}

const gen = rough.generator();
const seedOf = (key: string) => (rngFor(key).seed % 2147483646) + 1;

/** Point du bord d'une boîte (avec marge) en direction d'un point. */
function edgeTowards(box: Box, towards: Pt, margin: number): Pt {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = towards.x - cx;
  const dy = towards.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = box.w / 2 + margin;
  const hh = box.h / 2 + margin;
  const t = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: cx + dx * t, y: cy + dy * t };
}

/** Bord d'un cercle (nœud central) en direction d'un point. */
function circleEdge(center: Pt, r: number, towards: Pt): Pt {
  const dx = towards.x - center.x;
  const dy = towards.y - center.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: center.x + (dx / len) * r, y: center.y + (dy / len) * r };
}

export function computeLinks(root: HTMLElement, data: BoardData, scale: number): LinkGeometry {
  const rr = root.getBoundingClientRect();
  const boxOf = (id: string): Box | null => {
    const node = root.querySelector(`[data-el="${id}"]`);
    if (!node) return null;
    const r = node.getBoundingClientRect();
    return { x: (r.left - rr.left) / scale, y: (r.top - rr.top) / scale, w: r.width / scale, h: r.height / scale };
  };
  const colorOf = (gid: string) => data.groups.find((g) => g.id === gid)?.color ?? "#0F1535";
  const centerPt = { x: data.center.x, y: data.center.y };
  const centerR = data.center.size / 2;

  const paths: PathItem[] = [];
  const labels: LinkLabel[] = [];

  data.links.forEach((l: Link, i) => {
    const key = `link/${l.from}-${l.to}-${i}`;
    const r = rngFor(key);
    const a = l.from === "llc" ? null : boxOf(l.from);
    const b = l.to === "llc" ? null : boxOf(l.to);
    if ((l.from !== "llc" && !a) || (l.to !== "llc" && !b)) return;
    const aCenter = a ? { x: a.x + a.w / 2, y: a.y + a.h / 2 } : centerPt;
    const bCenter = b ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : centerPt;
    const start = a ? edgeTowards(a, bCenter, 8) : circleEdge(centerPt, centerR + 6, aCenter);
    const end = b ? edgeTowards(b, aCenter, 8) : circleEdge(centerPt, centerR + 6, bCenter);
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const bend = l.bend ?? 0;
    const ctrl = { x: mx - dy * bend * 0.35, y: my + dx * bend * 0.35 };
    const color = colorOf(l.group);
    const drawable = gen.curve(
      [
        [start.x, start.y],
        [ctrl.x, ctrl.y],
        [end.x, end.y],
      ],
      { stroke: color, strokeWidth: 1.5, roughness: 0.9, bowing: 0.8, disableMultiStroke: true, seed: seedOf(key) },
    );
    gen.toPaths(drawable).forEach((p, j) => paths.push({ key: `${key}/${j}`, d: p.d, stroke: p.stroke, strokeWidth: p.strokeWidth }));
    // Petit point à l'arrivée.
    const dot = gen.circle(end.x, end.y, 9, { stroke: color, strokeWidth: 1.5, fill: color, fillStyle: "solid", roughness: 0.6, seed: seedOf(`${key}/dot`) });
    gen.toPaths(dot).forEach((p, j) =>
      paths.push({ key: `${key}/dot/${j}`, d: p.d, stroke: p.stroke, strokeWidth: p.strokeWidth, fill: p.fill !== "none" ? p.fill : undefined }),
    );
    if (l.label) {
      // Étiquette plutôt du côté de l'élément que du nœud central.
      const t = l.to === "llc" ? r.range(0.3, 0.42) : 0.5;
      const lx = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x;
      const ly = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y;
      labels.push({ key: `${key}/label`, x: lx, y: ly, text: l.label, color, rotate: r.range(-4, 4) });
    }
  });

  return { paths, labels };
}
