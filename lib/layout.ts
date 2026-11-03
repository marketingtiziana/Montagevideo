import type { ClusterId, Mindmap, MindmapNode, NodeSize } from '@/data/types';
import { createRandom } from '@/lib/random';

export type LayoutMode = 'scatter' | 'tidy';

export interface Placement {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export type Layout = Record<string, Placement>;

/** Dimensions mesurées à l'écran (par identifiant), fournies par React Flow après le premier rendu. */
export type MeasuredSizes = Record<string, [number, number]>;

/** Dimensions nominales (px) par type et taille, utilisées avant la première mesure. */
const SIZES: Record<MindmapNode['kind'], Record<NodeSize, [number, number]>> = {
  sticky: { sm: [210, 130], md: [240, 150], lg: [270, 170] },
  photo: { sm: [228, 270], md: [264, 300], lg: [304, 330] },
  schema: { sm: [288, 290], md: [328, 320], lg: [368, 350] },
  card: { sm: [240, 300], md: [260, 310], lg: [280, 320] },
  callout: { sm: [232, 150], md: [262, 170], lg: [298, 190] },
};

const ROOT_SIZE: [number, number] = [270, 180];

export function nodeSize(node: MindmapNode, isRoot: boolean, measured?: MeasuredSizes): [number, number] {
  const m = measured?.[node.id];
  if (m) return m;
  if (isRoot) return ROOT_SIZE;
  return SIZES[node.kind][node.size ?? 'md'];
}

interface Sector {
  start: number;
  end: number;
}

interface Box {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  fixed: boolean;
}

function groupByCluster(map: Mindmap): Map<ClusterId, MindmapNode[]> {
  const perCluster = new Map<ClusterId, MindmapNode[]>();
  for (const n of map.nodes) {
    if (n.id === map.rootId) continue;
    const list = perCluster.get(n.cluster) ?? [];
    list.push(n);
    perCluster.set(n.cluster, list);
  }
  return perCluster;
}

/** Répartit les clusters (hors « core ») en secteurs angulaires proportionnels à leur nombre de nœuds. */
function buildSectors(map: Mindmap, startAngle: number): Record<ClusterId, Sector> {
  const groups = groupByCluster(map);
  const ordered = map.clusters.filter((c) => c.id !== 'core' && groups.has(c.id));
  const total = ordered.reduce((acc, c) => acc + (groups.get(c.id)?.length ?? 0), 0);
  const sectors = {} as Record<ClusterId, Sector>;
  let cursor = startAngle;
  for (const c of ordered) {
    const share = ((groups.get(c.id)?.length ?? 0) / total) * Math.PI * 2;
    sectors[c.id] = { start: cursor, end: cursor + share };
    cursor += share;
  }
  sectors.core = { start: 0, end: Math.PI * 2 };
  return sectors;
}

function ringOf(node: MindmapNode, index: number): number {
  return node.ring ?? (index % 2 === 0 ? 0 : 1);
}

/**
 * Anti-collision : écarte les rectangles qui se chevauchent au-delà de la marge.
 * `margin` négatif => légers chevauchements autorisés (mode désordre).
 * Déterministe : aucun aléa, ordre de parcours fixe.
 */
function relax(boxes: Box[], margin: number, iterations: number) {
  for (let it = 0; it < iterations; it += 1) {
    let moved = false;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = (a.w + b.w) / 2 + margin - Math.abs(dx);
        const overlapY = (a.h + b.h) / 2 + margin - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        const both = !a.fixed && !b.fixed;
        if (overlapX < overlapY) {
          const push = both ? overlapX / 2 + 0.5 : overlapX + 1;
          const sign = dx >= 0 ? 1 : dx < 0 ? -1 : i % 2 === 0 ? 1 : -1;
          if (!a.fixed) a.cx -= push * sign;
          if (!b.fixed) b.cx += push * sign;
        } else {
          const push = both ? overlapY / 2 + 0.5 : overlapY + 1;
          const sign = dy >= 0 ? 1 : dy < 0 ? -1 : i % 2 === 0 ? 1 : -1;
          if (!a.fixed) a.cy -= push * sign;
          if (!b.fixed) b.cy += push * sign;
        }
      }
    }
    if (!moved) break;
  }
}

function toLayout(boxes: Box[], rotations: Record<string, number>): Layout {
  const layout: Layout = {};
  for (const b of boxes) {
    layout[b.id] = {
      x: Math.round(b.cx - b.w / 2),
      y: Math.round(b.cy - b.h / 2),
      rotation: rotations[b.id] ?? 0,
      width: b.w,
      height: b.h,
    };
  }
  return layout;
}

/** Aplatissement vertical du board (les écrans sont plus larges que hauts). */
const SQUASH = 0.86;

/** Layout « désordre organisé » : nœuds éparpillés par secteur autour du centre, rotations légères, aléatoire déterministe. */
export function scatterLayout(map: Mindmap, measured?: MeasuredSizes): Layout {
  const rnd = createRandom(map.seed);
  const sectors = buildSectors(map, -Math.PI / 2 + rnd.range(-0.25, 0.25));
  const groups = groupByCluster(map);
  const boxes: Box[] = [];
  const rotations: Record<string, number> = {};

  const root = map.nodes.find((n) => n.id === map.rootId);
  if (root) {
    const [w, h] = nodeSize(root, true, measured);
    boxes.push({ id: root.id, cx: 0, cy: 0, w, h, fixed: true });
    rotations[root.id] = rnd.range(-2, 2);
  }

  const RING_RADIUS = [600, 930, 1240];

  for (const [clusterId, nodes] of Array.from(groups.entries())) {
    const sector = sectors[clusterId];
    const span = sector.end - sector.start;
    nodes.forEach((n, idx) => {
      const [w, h] = nodeSize(n, false, measured);
      let radius: number;
      let angle: number;
      if (clusterId === 'core') {
        // Les notes « cœur » gravitent tout près du nœud central.
        radius = rnd.range(300, 360);
        angle = -Math.PI / 2 + (idx / nodes.length) * Math.PI * 2 + rnd.range(-0.25, 0.25);
      } else {
        const ring = ringOf(n, idx);
        radius = RING_RADIUS[Math.min(ring, 2)] + rnd.range(-80, 80);
        // Position angulaire : étalée dans le secteur, avec un décalage par anneau pour casser les alignements.
        const t = (idx + 0.5) / nodes.length;
        angle = sector.start + span * t + rnd.range(-span * 0.16, span * 0.16);
      }
      boxes.push({ id: n.id, cx: Math.cos(angle) * radius, cy: Math.sin(angle) * radius * SQUASH, w, h, fixed: false });
      rotations[n.id] = rnd.range(-4, 4);
    });
  }

  relax(boxes, -16, 600);
  return toLayout(boxes, rotations);
}

/**
 * Layout radial « rangé » : chaque cluster forme un pétale (grille compacte) autour du centre,
 * les notes « cœur » forment un anneau intérieur, aucune rotation.
 */
export function tidyLayout(map: Mindmap, measured?: MeasuredSizes): Layout {
  const sectors = buildSectors(map, -Math.PI / 2);
  const groups = groupByCluster(map);
  const boxes: Box[] = [];
  const rotations: Record<string, number> = {};
  const GAP = 28;

  const root = map.nodes.find((n) => n.id === map.rootId);
  if (root) {
    const [w, h] = nodeSize(root, true, measured);
    boxes.push({ id: root.id, cx: 0, cy: 0, w, h, fixed: true });
    rotations[root.id] = 0;
  }

  const core = groups.get('core') ?? [];
  core.forEach((n, idx) => {
    const [w, h] = nodeSize(n, false, measured);
    const angle = -Math.PI / 2 + (idx / Math.max(core.length, 1)) * Math.PI * 2;
    boxes.push({ id: n.id, cx: Math.cos(angle) * 380, cy: Math.sin(angle) * 300, w, h, fixed: false });
    rotations[n.id] = 0;
  });

  for (const [clusterId, nodes] of Array.from(groups.entries())) {
    if (clusterId === 'core') continue;
    const sector = sectors[clusterId];
    const mid = (sector.start + sector.end) / 2;
    // Tri : anneau intérieur d'abord, puis par hauteur décroissante pour des lignes régulières.
    const sorted = nodes
      .map((n, i) => ({ n, ring: ringOf(n, i), size: nodeSize(n, false, measured) }))
      .sort((a, b) => a.ring - b.ring || b.size[1] - a.size[1]);

    // Largeur cible du pétale : un bloc légèrement plus large que haut.
    const area = sorted.reduce((acc, s) => acc + (s.size[0] + GAP) * (s.size[1] + GAP), 0);
    const maxW = Math.max(...sorted.map((s) => s.size[0] + GAP));
    const targetW = Math.max(maxW, Math.sqrt(area * 1.5));

    // Empilement par lignes (flow) : chaque ligne a sa propre hauteur, les colonnes épousent les largeurs réelles.
    const rows: { items: typeof sorted; width: number; height: number }[] = [];
    for (const s of sorted) {
      const w = s.size[0] + GAP;
      const last = rows[rows.length - 1];
      if (last && last.width + w <= targetW) {
        last.items.push(s);
        last.width += w;
        last.height = Math.max(last.height, s.size[1] + GAP);
      } else {
        rows.push({ items: [s], width: w, height: s.size[1] + GAP });
      }
    }
    const blockW = Math.max(...rows.map((r) => r.width));
    const blockH = rows.reduce((acc, r) => acc + r.height, 0);

    // Le bord intérieur du pétale est placé à distance fixe du centre, quelle que soit sa taille.
    const INNER = 470;
    const distance = INNER + Math.abs(Math.cos(mid)) * (blockW / 2) + Math.abs(Math.sin(mid)) * (blockH / 2);
    const cx0 = Math.cos(mid) * distance;
    const cy0 = Math.sin(mid) * distance * 0.92;

    let y = cy0 - blockH / 2;
    for (const row of rows) {
      let x = cx0 - row.width / 2;
      for (const s of row.items) {
        const [w, h] = s.size;
        boxes.push({ id: s.n.id, cx: x + (w + GAP) / 2, cy: y + row.height / 2, w, h, fixed: false });
        rotations[s.n.id] = 0;
        x += w + GAP;
      }
      y += row.height;
    }
  }

  relax(boxes, 24, 400);
  return toLayout(boxes, rotations);
}

export function computeLayout(map: Mindmap, mode: LayoutMode, measured?: MeasuredSizes): Layout {
  return mode === 'scatter' ? scatterLayout(map, measured) : tidyLayout(map, measured);
}
