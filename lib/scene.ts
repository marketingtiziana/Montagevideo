import type { BoardData, BoardElement, Group, GroupId, SceneAssets, SchemaSpec } from "@/data/types";
import { rngFor } from "./rng";

/**
 * Construit la scène Excalidraw (format « skeleton ») à partir de data/board.ts :
 * disposition éparpillée à seed fixe autour du nœud central, blocs, images, schémas et flèches.
 * Pur TypeScript, sans DOM : la conversion en éléments se fait dans le navigateur
 * (convertToExcalidrawElements) via scripts/build-scene.ts.
 */
export const NAVY = "#0F1535";
export const INDIGO = "#4F6BFF";
export const PAPER = "#F7F8FB";
const LINE_COLOR = "#3B4468";
const FONT = 5; // Excalifont, tracé à la main

export type Skeleton = Record<string, unknown>;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const BLOCK = { w: 380, h: 104 };
const NOTE = { w: 360, h: 96 };
const SCHEMA_SIZE: Record<SchemaSpec["kind"], { w: number; h: number }> = {
  org: { w: 800, h: 600 },
  money: { w: 440, h: 560 },
  transparency: { w: 480, h: 480 },
  timeline: { w: 560, h: 580 },
  calendar: { w: 680, h: 420 },
};

const overlaps = (a: Box, b: Box, margin: number) =>
  a.x < b.x + b.w + margin && a.x + a.w + margin > b.x && a.y < b.y + b.h + margin && a.y + a.h + margin > b.y;

function wrap(text: string, maxChars: number): string {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

interface Ctx {
  data: BoardData;
  assets: SceneAssets;
  placed: Box[];
  out: Skeleton[];
  /** Élément à viser pour une flèche vers un id logique. */
  anchor: Record<string, string>;
  /** Pour un schéma : ses sous-blocs, la flèche part du plus proche de la cible. */
  anchorCandidates: Record<string, string[]>;
  boxOf: Record<string, Box>;
}

function resolveAnchor(ctx: Ctx, id: string, towards: string): string | undefined {
  const candidates = ctx.anchorCandidates[id];
  const target = ctx.boxOf[ctx.anchor[towards] ?? towards];
  if (!candidates || !target) return ctx.anchor[id];
  const tc = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
  let best = candidates[0];
  let bestD = Infinity;
  for (const c of candidates) {
    const b = ctx.boxOf[c];
    if (!b) continue;
    const d = Math.hypot(b.x + b.w / 2 - tc.x, b.y + b.h / 2 - tc.y);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

interface Pt {
  x: number;
  y: number;
}

/** Point du bord d'une boîte (ou du cercle central) en direction d'un point. */
function edgeTowards(box: Box, towards: Pt, margin: number, circle = false): Pt {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = towards.x - cx;
  const dy = towards.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  if (circle) {
    const len = Math.hypot(dx, dy);
    const r = box.w / 2 + margin;
    return { x: cx + (dx / len) * r, y: cy + (dy / len) * r };
  }
  const hw = box.w / 2 + margin;
  const hh = box.h / 2 + margin;
  const t = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: cx + dx * t, y: cy + dy * t };
}

/** Flèche entre deux éléments connus : géométrie calculée, liaison par id. */
function arrowBetween(ctx: Ctx, id: string, from: string, to: string, color: string, group: GroupId, label?: string, fontSize = 20): Skeleton | null {
  const a = ctx.boxOf[from];
  const b = ctx.boxOf[to];
  if (!a || !b) return null;
  const aC = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bC = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const start = edgeTowards(a, bC, 8, from === "llc");
  const end = edgeTowards(b, aC, 8, to === "llc");
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return {
    type: "arrow",
    id,
    x: start.x,
    y: start.y,
    width: Math.abs(dx),
    height: Math.abs(dy),
    points: [
      [0, 0],
      [dx, dy],
    ],
    start: { id: from },
    end: { id: to },
    ...(label ? { label: { text: label, fontSize, fontFamily: FONT, strokeColor: color } } : {}),
    strokeColor: color,
    strokeWidth: 2,
    roughness: 2,
    endArrowhead: "arrow",
    customData: { group },
  };
}

function groupOf(data: BoardData, id: GroupId): Group {
  const g = data.groups.find((x) => x.id === id);
  if (!g) throw new Error(`groupe inconnu : ${id}`);
  return g;
}

function zoneOf(g: Group): Box {
  const a = (g.angle * Math.PI) / 180;
  const cx = Math.cos(a) * g.radius;
  const cy = Math.sin(a) * g.radius;
  return { x: cx - g.zone.w / 2, y: cy - g.zone.h / 2, w: g.zone.w, h: g.zone.h };
}

/** Cherche une place libre dans la zone (aléatoire à seed fixe), en l'élargissant au besoin. */
function findSpot(ctx: Ctx, key: string, zone: Box, w: number, h: number, margin = 70): Box {
  const r = rngFor(`pos/${key}`);
  let z = zone;
  for (let tries = 0; tries < 1200; tries++) {
    if (tries > 0 && tries % 150 === 0) z = { x: z.x - z.w * 0.1, y: z.y - z.h * 0.1, w: z.w * 1.2, h: z.h * 1.2 };
    const box = { x: Math.round(z.x + r.next() * Math.max(1, z.w - w)), y: Math.round(z.y + r.next() * Math.max(1, z.h - h)), w, h };
    if (!ctx.placed.some((p) => overlaps(box, p, margin))) return box;
  }
  return { x: zone.x, y: zone.y, w, h };
}

/** Place une image contre un bloc : à droite, à gauche, en dessous ou au-dessus. */
function findBeside(ctx: Ctx, key: string, block: Box, w: number, h: number): Box {
  const r = rngFor(`beside/${key}`);
  const gap = 36;
  const candidates: Box[] = [
    { x: block.x + block.w + gap, y: block.y - 30, w, h },
    { x: block.x - w - gap, y: block.y - 30, w, h },
    { x: block.x + 20, y: block.y + block.h + 70, w, h },
    { x: block.x + 20, y: block.y - h - gap, w, h },
    { x: block.x + block.w + gap, y: block.y + 80, w, h },
    { x: block.x - w - gap, y: block.y + 80, w, h },
  ];
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(r.next() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const c of candidates) {
    const box = { ...c, x: Math.round(c.x + r.range(-16, 16)), y: Math.round(c.y + r.range(-16, 16)) };
    if (!ctx.placed.some((p) => overlaps(box, p, 50))) return box;
  }
  return findSpot(ctx, key, { x: block.x - 500, y: block.y - 400, w: 1000 + block.w, h: 800 + block.h }, w, h);
}

function imageSkeleton(ctx: Ctx, elId: string, imageId: string, box: Box, group: Group, angle: number): Skeleton {
  const spec = ctx.data.images.find((i) => i.id === imageId);
  const asset = ctx.assets.images[imageId];
  const base = { id: elId, x: box.x, y: box.y, width: box.w, height: box.h, angle, customData: { group: group.id, image: imageId } };
  if (asset) return { type: "image", fileId: imageId, ...base };
  return {
    type: "rectangle",
    ...base,
    label: { text: spec?.label ?? imageId, fontSize: 22, fontFamily: FONT, strokeColor: NAVY },
    strokeColor: "#64748B",
    backgroundColor: "#C9D4F0",
    fillStyle: "hachure",
    roughness: 2,
    strokeWidth: 2,
    roundness: { type: 3 },
  };
}

function imageSize(ctx: Ctx, imageId: string): { w: number; h: number } {
  const spec = ctx.data.images.find((i) => i.id === imageId);
  if (!spec) throw new Error(`image inconnue : ${imageId}`);
  const asset = ctx.assets.images[imageId];
  const aspect = asset ? asset.width / asset.height : spec.aspect;
  return { w: spec.width, h: Math.round(spec.width / aspect) };
}

function block(ctx: Ctx, el: Extract<BoardElement, { type: "block" | "note" }>, group: Group, box: Box, fontSize: number) {
  const r = rngFor(`rot/${el.id}`);
  ctx.out.push({
    type: "rectangle",
    id: el.id,
    x: box.x,
    y: box.y,
    width: box.w,
    height: box.h,
    angle: r.range(-0.02, 0.02),
    label: { text: el.title, fontSize, fontFamily: FONT, strokeColor: NAVY },
    strokeColor: NAVY,
    backgroundColor: group.fill,
    fillStyle: "solid",
    roughness: 2,
    strokeWidth: 2,
    roundness: { type: 3 },
    customData: { group: group.id },
  });
  if (el.line) {
    ctx.out.push({
      type: "text",
      id: `${el.id}-line`,
      x: box.x,
      y: box.y + box.h + 14,
      text: wrap(el.line, 38),
      fontSize: 20,
      fontFamily: FONT,
      textAlign: "left",
      strokeColor: LINE_COLOR,
      customData: { group: group.id },
    });
  }
  ctx.anchor[el.id] = el.id;
  ctx.boxOf[el.id] = box;
}

function schemaBox(ctx: Ctx, id: string, x: number, y: number, w: number, h: number, text: string, group: Group, opts: Partial<{ dark: boolean; dashed: boolean; fontSize: number }> = {}) {
  ctx.out.push({
    type: "rectangle",
    id,
    x,
    y,
    width: w,
    height: h,
    label: { text, fontSize: opts.fontSize ?? 22, fontFamily: FONT, strokeColor: opts.dark ? "#FFFFFF" : NAVY },
    strokeColor: NAVY,
    backgroundColor: opts.dark ? NAVY : group.fill,
    fillStyle: opts.dark ? "solid" : "hachure",
    strokeStyle: opts.dashed ? "dashed" : "solid",
    roughness: 2,
    strokeWidth: 2,
    roundness: { type: 3 },
    customData: { group: group.id },
  });
  ctx.boxOf[id] = { x, y, w, h };
}

function schemaArrow(ctx: Ctx, id: string, from: string, to: string, group: Group, label?: string) {
  const arrow = arrowBetween(ctx, id, from, to, INDIGO, group.id, label, 18);
  if (arrow) ctx.out.push(arrow);
}

function schema(ctx: Ctx, el: Extract<BoardElement, { type: "schema" }>, group: Group, box: Box) {
  const { x: ox, y: oy } = box;
  const s = el.schema;
  const p = el.id;
  ctx.out.push({ type: "text", id: `${p}-title`, x: ox, y: oy - 48, text: el.title, fontSize: 26, fontFamily: FONT, strokeColor: NAVY, customData: { group: group.id } });
  ctx.boxOf[el.id] = box;
  switch (s.kind) {
    case "org": {
      schemaBox(ctx, `${p}-sos`, ox, oy, 280, 90, s.sos, group);
      schemaBox(ctx, `${p}-irs`, ox + 560, oy, 220, 90, s.irs, group);
      schemaBox(ctx, `${p}-agent`, ox, oy + 250, 220, 100, s.agent, group);
      schemaBox(ctx, `${p}-llc`, ox + 270, oy + 240, 260, 120, s.llc, group, { dark: true, fontSize: 36 });
      schemaBox(ctx, `${p}-manager`, ox + 580, oy + 250, 220, 100, s.manager, group, { dashed: true });
      schemaBox(ctx, `${p}-members`, ox + 250, oy + 500, 300, 100, s.members, group);
      schemaArrow(ctx, `${p}-a1`, `${p}-sos`, `${p}-llc`, group, s.edges.registers);
      schemaArrow(ctx, `${p}-a2`, `${p}-irs`, `${p}-llc`, group, s.edges.ein);
      schemaArrow(ctx, `${p}-a3`, `${p}-members`, `${p}-llc`, group, s.edges.owns);
      schemaArrow(ctx, `${p}-a4`, `${p}-manager`, `${p}-llc`, group, s.edges.manages);
      schemaArrow(ctx, `${p}-a5`, `${p}-agent`, `${p}-llc`, group, s.edges.agent);
      ctx.anchor[el.id] = `${p}-llc`;
      ctx.anchorCandidates[el.id] = [`${p}-sos`, `${p}-irs`, `${p}-agent`, `${p}-llc`, `${p}-manager`, `${p}-members`];
      break;
    }
    case "money": {
      s.steps.forEach((step, i) => schemaBox(ctx, `${p}-s${i}`, ox + 20, oy + i * 150, 400, 90, step, group));
      s.arrows.forEach((a, i) => schemaArrow(ctx, `${p}-a${i}`, `${p}-s${i}`, `${p}-s${i + 1}`, group, a));
      ctx.anchor[el.id] = `${p}-s1`;
      ctx.anchorCandidates[el.id] = s.steps.map((_, i) => `${p}-s${i}`);
      break;
    }
    case "transparency": {
      schemaBox(ctx, `${p}-llc`, ox + 60, oy, 360, 110, `${s.llc}\n${s.llcLine}`, group, { dashed: true });
      schemaBox(ctx, `${p}-member`, ox + 60, oy + 360, 360, 110, `${s.member}\n${s.memberLine}`, group);
      schemaArrow(ctx, `${p}-a1`, `${p}-llc`, `${p}-member`, group, s.through);
      ctx.anchor[el.id] = `${p}-llc`;
      ctx.anchorCandidates[el.id] = [`${p}-llc`, `${p}-member`];
      break;
    }
    case "timeline": {
      s.steps.forEach((step, i) => schemaBox(ctx, `${p}-s${i}`, ox + (i % 2) * 120, oy + i * 96, 400, 70, `${i + 1}. ${step}`, group));
      s.steps.slice(1).forEach((_, i) => schemaArrow(ctx, `${p}-a${i}`, `${p}-s${i}`, `${p}-s${i + 1}`, group));
      ctx.anchor[el.id] = `${p}-s0`;
      ctx.anchorCandidates[el.id] = s.steps.map((_, i) => `${p}-s${i}`);
      break;
    }
    case "calendar": {
      s.items.forEach((it, i) => {
        schemaBox(ctx, `${p}-w${i}`, ox, oy + i * 140, 220, 90, it.when, group, { dark: true, fontSize: 20 });
        schemaBox(ctx, `${p}-l${i}`, ox + 290, oy + i * 140, 390, 90, it.label, group);
        schemaArrow(ctx, `${p}-a${i}`, `${p}-w${i}`, `${p}-l${i}`, group);
      });
      ctx.anchor[el.id] = `${p}-l0`;
      ctx.anchorCandidates[el.id] = s.items.flatMap((_, i) => [`${p}-w${i}`, `${p}-l${i}`]);
      break;
    }
  }
}

export function buildSkeleton(data: BoardData, assets: SceneAssets): Skeleton[] {
  const ctx: Ctx = { data, assets, placed: [], out: [], anchor: {}, anchorCandidates: {}, boxOf: {} };
  const S = data.center.size;

  // Nœud central
  ctx.placed.push({ x: -S / 2 - 120, y: -S / 2 - 120, w: S + 240, h: S + 300 });
  ctx.out.push({
    type: "ellipse",
    id: "llc",
    x: -S / 2,
    y: -S / 2,
    width: S,
    height: S,
    label: { text: data.center.label, fontSize: 84, fontFamily: FONT, strokeColor: "#FFFFFF" },
    strokeColor: NAVY,
    backgroundColor: NAVY,
    fillStyle: "solid",
    roughness: 2,
    strokeWidth: 2,
  });
  ctx.out.push({ type: "text", id: "llc-sub", x: -150, y: S / 2 + 24, text: data.center.sub, fontSize: 24, fontFamily: FONT, strokeColor: NAVY, textAlign: "center" });
  ctx.anchor.llc = "llc";
  ctx.boxOf.llc = { x: -S / 2, y: -S / 2, w: S, h: S };

  // Groupes
  for (const g of data.groups) {
    const zone = zoneOf(g);
    const before = ctx.placed.length;
    const els = data.elements.filter((e) => e.group === g.id);
    for (const el of els) {
      if (el.type === "block" || el.type === "note") {
        const size = el.type === "block" ? BLOCK : NOTE;
        const h = size.h + (el.line ? 60 : 0);
        const box = findSpot(ctx, el.id, zone, size.w, h);
        ctx.placed.push(box);
        block(ctx, el, g, { ...box, h: size.h }, el.type === "block" ? 28 : 24);
        if (el.type === "block" && el.image) {
          const { w, h: ih } = imageSize(ctx, el.image);
          const ib = findBeside(ctx, `${el.id}/${el.image}`, box, w, ih);
          ctx.placed.push(ib);
          const rr = rngFor(`rot/${el.id}/${el.image}`);
          ctx.out.push(imageSkeleton(ctx, `img-${el.image}`, el.image, ib, g, rr.range(-0.07, 0.07)));
          ctx.anchor[`img-${el.image}`] = `img-${el.image}`;
          ctx.boxOf[`img-${el.image}`] = ib;
        }
      } else if (el.type === "image") {
        const { w, h } = imageSize(ctx, el.image);
        const box = findSpot(ctx, el.id, zone, w, h);
        ctx.placed.push(box);
        const rr = rngFor(`rot/${el.id}`);
        ctx.out.push(imageSkeleton(ctx, el.id, el.image, box, g, rr.range(-0.07, 0.07)));
        ctx.anchor[el.id] = el.id;
        ctx.boxOf[el.id] = box;
      } else if (el.type === "schema") {
        const size = SCHEMA_SIZE[el.schema.kind];
        const box = findSpot(ctx, el.id, zone, size.w, size.h + 60, 90);
        ctx.placed.push(box);
        schema(ctx, el, g, { ...box, y: box.y + 60 });
      }
    }
    // Intitulé du groupe : au-dessus du contenu réellement placé.
    const mine = ctx.placed.slice(before);
    const minX = Math.min(...mine.map((b) => b.x));
    const minY = Math.min(...mine.map((b) => b.y));
    const r = rngFor(`title/${g.id}`);
    const title = { x: minX + r.range(0, 60), y: minY - 130, w: g.title.length * 26 + 40, h: 70 };
    ctx.placed.push(title);
    ctx.out.push({
      type: "text",
      id: `title-${g.id}`,
      x: title.x,
      y: title.y,
      text: g.title,
      fontSize: 44,
      fontFamily: FONT,
      strokeColor: g.color,
      angle: r.range(-0.03, 0.03),
      customData: { group: g.id },
    });
  }

  // Flèches entre éléments
  data.links.forEach((l, i) => {
    const from = resolveAnchor(ctx, l.from, l.to);
    const to = resolveAnchor(ctx, l.to, l.from);
    if (!from || !to) return;
    const g = groupOf(data, l.group);
    const arrow = arrowBetween(ctx, `link-${i}`, from, to, g.color, g.id, l.label);
    if (arrow) ctx.out.push(arrow);
  });

  return ctx.out;
}

/**
 * Après conversion : courbe les flèches (point intermédiaire décalé, seed fixe).
 */
export function curveArrows<T extends { type: string; id: string; points?: unknown; roundness?: unknown }>(elements: T[]): T[] {
  return elements.map((el) => {
    if (el.type !== "arrow" || !Array.isArray(el.points) || el.points.length !== 2) return el;
    const [p0, p1] = el.points as [number, number][];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    const r = rngFor(`curve/${el.id}`);
    const k = r.range(0.08, 0.16) * (r.next() < 0.5 ? -1 : 1) * len;
    const mid: [number, number] = [p0[0] + dx / 2 - (dy / len) * k, p0[1] + dy / 2 + (dx / len) * k];
    return { ...el, points: [p0, mid, p1], roundness: { type: 2 } };
  });
}
