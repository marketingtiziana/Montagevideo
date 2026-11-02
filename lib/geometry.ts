import rough from "roughjs/bin/rough";
import type { Options } from "roughjs/bin/core";
import type { Annotation, BoardElement, NoteTone, Section } from "@/data/types";
import { BOARD_WIDTH, SPINE_X } from "./layout";
import { rngFor } from "./rng";

export interface Pt {
  x: number;
  y: number;
}
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PathItem {
  key: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface BranchLabel {
  key: string;
  x: number;
  y: number;
  text: string;
  color: string;
  rotate: number;
}

export interface NoteItem {
  key: string;
  x: number;
  y: number;
  text: string;
  rotate: number;
  tone: NoteTone;
  width: number;
  /** Translation CSS pour accrocher le bon coin de la note au point (x, y). */
  translate: string;
  arrowTo?: Pt;
  color: string;
}

export interface Geometry {
  height: number;
  back: PathItem[];
  front: PathItem[];
  labels: BranchLabel[];
  notes: NoteItem[];
}

export const NOTE_BG: Record<NoteTone, string> = {
  indigo: "#E8ECFF",
  sky: "#E0F2FE",
  slate: "#E2E8F0",
  mint: "#D9F5EE",
};

const RED = "#E5484D";
const NAVY = "#0F1535";

const gen = rough.generator();

function toItems(drawable: ReturnType<typeof gen.line>, key: string): PathItem[] {
  return gen.toPaths(drawable).map((p, i) => ({
    key: `${key}/${i}`,
    d: p.d,
    stroke: p.stroke,
    strokeWidth: p.strokeWidth,
    fill: p.fill && p.fill !== "none" ? p.fill : undefined,
  }));
}

function seedOf(key: string) {
  return (rngFor(key).seed % 2147483646) + 1;
}

function arrowHead(to: Pt, from: Pt, color: string, key: string, size = 18): PathItem[] {
  const ang = Math.atan2(to.y - from.y, to.x - from.x);
  const a1 = ang + Math.PI * 0.8;
  const a2 = ang - Math.PI * 0.8;
  const opts: Options = { stroke: color, strokeWidth: 3, roughness: 1, seed: seedOf(key) };
  return [
    ...toItems(gen.line(to.x, to.y, to.x + Math.cos(a1) * size, to.y + Math.sin(a1) * size, opts), `${key}/h1`),
    ...toItems(gen.line(to.x, to.y, to.x + Math.cos(a2) * size, to.y + Math.sin(a2) * size, opts), `${key}/h2`),
  ];
}

/** Point du bord d'une boîte le plus proche d'un point extérieur, avec marge. */
function edgeTowards(box: Box, from: Pt, margin = 10): Pt {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = from.x - cx;
  const dy = from.y - cy;
  const hw = box.w / 2 + margin;
  const hh = box.h / 2 + margin;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const t = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: cx + dx * t, y: cy + dy * t };
}

export function computeGeometry(root: HTMLElement, sections: Section[]): Geometry {
  const rr = root.getBoundingClientRect();
  const scale = rr.width / BOARD_WIDTH || 1;
  const box = (e: Element): Box => {
    const r = e.getBoundingClientRect();
    return { x: (r.left - rr.left) / scale, y: (r.top - rr.top) / scale, w: r.width / scale, h: r.height / scale };
  };
  const height = root.offsetHeight;
  const back: PathItem[] = [];
  const front: PathItem[] = [];
  const labels: BranchLabel[] = [];
  const notes: NoteItem[] = [];

  const nodeCenters: Pt[] = [];
  sections.forEach((s) => {
    const node = root.querySelector(`[data-node="${s.id}"]`);
    if (!node) return;
    const b = box(node);
    nodeCenters.push({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  });
  const endNode = root.querySelector(`[data-node="end"]`);
  const endCenter = endNode ? (() => { const b = box(endNode); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; })() : null;

  // Trait central, segment par segment
  sections.forEach((s, i) => {
    const c = nodeCenters[i];
    if (!c) return;
    const next = nodeCenters[i + 1] ?? endCenter;
    const y1 = next ? next.y : height - 80;
    back.push(
      ...toItems(
        gen.line(SPINE_X, c.y, SPINE_X, y1, {
          stroke: NAVY,
          strokeWidth: 3,
          roughness: 0.9,
          bowing: 0.6,
          disableMultiStroke: true,
          seed: seedOf(`spine/${s.id}`),
        }),
        `spine/${s.id}`,
      ),
    );
  });

  // Noeuds de section
  sections.forEach((s, i) => {
    const c = nodeCenters[i];
    if (!c) return;
    back.push(
      ...toItems(
        gen.circle(c.x, c.y, 66, {
          stroke: NAVY,
          strokeWidth: 3,
          fill: s.color,
          fillStyle: "solid",
          roughness: 1.2,
          seed: seedOf(`node/${s.id}`),
        }),
        `node/${s.id}`,
      ),
    );
    const title = root.querySelector(`[data-title="${s.id}"]`);
    if (title) {
      const t = box(title);
      back.push(
        ...toItems(
          gen.line(t.x - 6, t.y + t.h + 8, t.x + t.w + 6, t.y + t.h + 12, {
            stroke: s.color,
            strokeWidth: 5,
            roughness: 1.6,
            bowing: 2,
            seed: seedOf(`title/${s.id}`),
          }),
          `title/${s.id}`,
        ),
      );
    }
  });
  if (endCenter) {
    back.push(
      ...toItems(
        gen.circle(endCenter.x, endCenter.y, 40, {
          stroke: NAVY,
          strokeWidth: 3,
          fill: NAVY,
          fillStyle: "solid",
          roughness: 1.2,
          seed: seedOf("node/end"),
        }),
        "node/end",
      ),
    );
  }

  // Branches + annotations
  sections.forEach((s) => {
    s.elements.forEach((el: BoardElement) => {
      const node = root.querySelector(`[data-el="${el.id}"]`);
      if (!node) return;
      const b = box(node);
      const r = rngFor(`branch/${el.id}`);
      const color = el.branch?.color ?? (s.columns ? (el.side === "left" ? s.columns.left.color : s.columns.right.color) : s.color);
      const t = r.range(0.25, 0.7);
      const endY = b.y + b.h * t;
      const end: Pt = el.side === "left" ? { x: b.x + b.w - 8, y: endY } : { x: b.x + 8, y: endY };
      const start: Pt = { x: SPINE_X, y: endY + r.range(-110, 50) };
      const mid: Pt = {
        x: start.x + (end.x - start.x) * 0.55,
        y: start.y + (end.y - start.y) * 0.3,
      };
      back.push(
        ...toItems(
          gen.curve([start, mid, end].map((p) => [p.x, p.y] as [number, number]), {
            stroke: color,
            strokeWidth: 3,
            roughness: 1.1,
            bowing: 1,
            seed: seedOf(`branch/${el.id}`),
          }),
          `branch/${el.id}`,
        ),
      );
      // Petit point sur le trait central, là où part la branche.
      back.push(
        ...toItems(
          gen.circle(start.x, start.y, 12, { stroke: color, strokeWidth: 2, fill: color, fillStyle: "solid", roughness: 0.8, seed: seedOf(`dot/${el.id}`) }),
          `dot/${el.id}`,
        ),
      );
      if (el.branch?.label) {
        // Largeur estimée de l'étiquette. Toujours du côté de sa carte : au pire l'étiquette mord sur le bord de la carte.
        const estW = el.branch.label.length * 13.5 + 36;
        const dir = el.side === "left" ? -1 : 1;
        const lx = start.x + dir * (estW / 2 + 6);
        const ly = start.y - 26;
        labels.push({ key: `label/${el.id}`, x: lx, y: ly, text: el.branch.label, color, rotate: r.range(-4, 4) });
      }

      (el.annotations ?? []).forEach((a: Annotation, ai) => {
        const key = `ann/${el.id}/${ai}`;
        const ar = rngFor(key);
        if (a.kind === "note") {
          const w = a.width ?? 240;
          const dx = a.dx ?? 0;
          const dy = a.dy ?? 0;
          let x = 0;
          let y = 0;
          let translate = "";
          switch (a.placement) {
            case "top-left":
              x = b.x + dx;
              y = b.y + dy;
              translate = "translate(-100%, -100%)";
              break;
            case "top-right":
              x = b.x + b.w + dx;
              y = b.y + dy;
              translate = "translate(0, -100%)";
              break;
            case "bottom-left":
              x = b.x + dx;
              y = b.y + b.h + dy;
              translate = "translate(-100%, 0)";
              break;
            case "bottom-right":
              x = b.x + b.w + dx;
              y = b.y + b.h + dy;
              translate = "translate(0, 0)";
              break;
          }
          let arrowTo: Pt | undefined;
          if (a.arrowTo) {
            const anchor = node.querySelector(`[data-anchor="${a.arrowTo}"]`);
            if (anchor) {
              const ab = box(anchor);
              arrowTo = { x: ab.x + ab.w / 2, y: ab.y + ab.h / 2 };
            }
          }
          notes.push({
            key,
            x,
            y,
            text: a.text,
            rotate: a.rotate ?? ar.range(-3, 3),
            tone: a.tone ?? "indigo",
            width: w,
            translate,
            arrowTo,
            color: a.tone === "mint" ? "#2BB39A" : a.tone === "slate" ? "#64748B" : a.tone === "sky" ? "#3FA9F5" : "#4F6BFF",
          });
          return;
        }
        const anchor = node.querySelector(`[data-anchor="${a.anchor}"]`);
        if (!anchor) return;
        const ab = box(anchor);
        if (a.kind === "circle") {
          const pad = a.padding ?? 22;
          const c = a.color ?? RED;
          front.push(
            ...toItems(
              gen.ellipse(ab.x + ab.w / 2, ab.y + ab.h / 2, ab.w + pad * 2, Math.max(ab.h + pad * 1.6, 56), {
                stroke: c,
                strokeWidth: 3.5,
                roughness: 1.6,
                bowing: 1.5,
                seed: seedOf(key),
              }),
              key,
            ),
          );
        } else if (a.kind === "underline") {
          const c = a.color ?? s.color;
          front.push(
            ...toItems(
              gen.line(ab.x - 4, ab.y + ab.h + 4, ab.x + ab.w + 4, ab.y + ab.h + 7, {
                stroke: c,
                strokeWidth: 3.5,
                roughness: 1.5,
                bowing: 2,
                seed: seedOf(key),
              }),
              key,
            ),
          );
        } else if (a.kind === "arrow") {
          const c = a.color ?? RED;
          const center = { x: ab.x + ab.w / 2, y: ab.y + ab.h / 2 };
          const from = { x: center.x + a.from.dx, y: center.y + a.from.dy };
          const to = edgeTowards(ab, from, 10);
          const bend = { x: (from.x + to.x) / 2 + (to.y - from.y) * 0.18, y: (from.y + to.y) / 2 - (to.x - from.x) * 0.18 };
          front.push(
            ...toItems(
              gen.curve(
                [from, bend, to].map((p) => [p.x, p.y] as [number, number]),
                { stroke: c, strokeWidth: 3, roughness: 1.2, seed: seedOf(key) },
              ),
              key,
            ),
            ...arrowHead(to, bend, c, key),
          );
        }
      });
    });
  });

  return { height, back, front, labels, notes };
}

/** Flèches des notes vers leur cible, calculées une fois les notes rendues. */
export function computeNoteArrows(root: HTMLElement, notes: NoteItem[]): PathItem[] {
  const rr = root.getBoundingClientRect();
  const scale = rr.width / BOARD_WIDTH || 1;
  const out: PathItem[] = [];
  notes.forEach((n) => {
    if (!n.arrowTo) return;
    const node = root.querySelector(`[data-note="${n.key}"]`);
    if (!node) return;
    const r = node.getBoundingClientRect();
    const b: Box = { x: (r.left - rr.left) / scale, y: (r.top - rr.top) / scale, w: r.width / scale, h: r.height / scale };
    const from = edgeTowards(b, n.arrowTo, 6);
    const to = n.arrowTo;
    const dir = { x: to.x - from.x, y: to.y - from.y };
    const len = Math.hypot(dir.x, dir.y) || 1;
    const tip = { x: to.x - (dir.x / len) * 26, y: to.y - (dir.y / len) * 26 };
    const bend = { x: (from.x + tip.x) / 2 + (tip.y - from.y) * 0.2, y: (from.y + tip.y) / 2 - (tip.x - from.x) * 0.2 };
    const key = `${n.key}/arrow`;
    out.push(
      ...toItems(
        gen.curve(
          [from, bend, tip].map((p) => [p.x, p.y] as [number, number]),
          { stroke: n.color, strokeWidth: 3, roughness: 1.2, seed: seedOf(key) },
        ),
        key,
      ),
      ...arrowHead(tip, bend, n.color, key),
    );
  });
  return out;
}
