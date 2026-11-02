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

/** Dimensions nominales (px) par type et taille, utilisées pour le placement et l'anti-collision. */
const SIZES: Record<MindmapNode['kind'], Record<NodeSize, [number, number]>> = {
  sticky: { sm: [200, 116], md: [228, 136], lg: [256, 156] },
  photo: { sm: [220, 196], md: [256, 224], lg: [296, 254] },
  schema: { sm: [280, 210], md: [320, 240], lg: [360, 270] },
  card: { sm: [232, 184], md: [252, 200], lg: [272, 216] },
  callout: { sm: [220, 128], md: [248, 148], lg: [284, 172] },
};

const ROOT_SIZE: [number, number] = [248, 128];

/** Dimensions mesurées à l'écran (par identifiant), fournies par React Flow après le premier rendu. */
export type MeasuredSizes = Record<string, [number, number]>;

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

/** Répartit les clusters (hors « core ») en secteurs angulaires proportionnels à leur nombre de nœuds. */
function buildSectors(map: Mindmap, startAngle: number): Record<ClusterId, Sector> {
  const counts = new Map<ClusterId, number>();
  for (const n of map.nodes) {
    if (n.id === map.rootId || n.cluster === 'core') continue;
    counts.set(n.cluster, (counts.get(n.cluster) ?? 0) + 1);
  }
  const ordered = map.clusters.filter((c) => c.id !== 'core' && counts.has(c.id));
  const total = ordered.reduce((acc, c) => acc + (counts.get(c.id) ?? 0), 0);
  const sectors = {} as Record<ClusterId, Sector>;
  let cursor = startAngle;
  for (const c of ordered) {
    const share = ((counts.get(c.id) ?? 0) / total) * Math.PI * 2;
    sectors[c.id] = { start: cursor, end: cursor + share };
    cursor += share;
  }
  sectors.core = { start: 0, end: Math.PI * 2 };
  return sectors;
}

interface Box {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  fixed: boolean;
}

/**
 * Anti-collision simple : écarte les rectangles qui se chevauchent au-delà de la marge.
 * `margin` négatif => légers chevauchements autorisés (mode désordre).
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
        // On pousse selon l'axe de moindre chevauchement.
        if (overlapX < overlapY) {
          const push = overlapX / 2 + 0.5;
          const sign = dx >= 0 ? 1 : -1;
          if (!a.fixed) a.cx -= push * sign;
          if (!b.fixed) b.cx += push * sign;
          if (a.fixed && !b.fixed) b.cx += push * sign;
          if (b.fixed && !a.fixed) a.cx -= push * sign;
        } else {
          const push = overlapY / 2 + 0.5;
          const sign = dy >= 0 ? 1 : -1;
          if (!a.fixed) a.cy -= push * sign;
          if (!b.fixed) b.cy += push * sign;
          if (a.fixed && !b.fixed) b.cy += push * sign;
          if (b.fixed && !a.fixed) a.cy -= push * sign;
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

/** Layout « désordre organisé » : nœuds éparpillés autour du centre, rotations légères, aléatoire déterministe. */
export function scatterLayout(map: Mindmap, measured?: MeasuredSizes): Layout {
  const rnd = createRandom(map.seed);
  const sectors = buildSectors(map, -Math.PI / 2 + rnd.range(-0.3, 0.3));
  const boxes: Box[] = [];
  const rotations: Record<string, number> = {};
  const perCluster = new Map<ClusterId, MindmapNode[]>();

  for (const n of map.nodes) {
    if (n.id === map.rootId) continue;
    const list = perCluster.get(n.cluster) ?? [];
    list.push(n);
    perCluster.set(n.cluster, list);
  }

  const root = map.nodes.find((n) => n.id === map.rootId);
  if (root) {
    const [w, h] = nodeSize(root, true, measured);
    boxes.push({ id: root.id, cx: 0, cy: 0, w, h, fixed: true });
    rotations[root.id] = rnd.range(-2, 2);
  }

  for (const [clusterId, nodes] of Array.from(perCluster.entries())) {
    const sector = sectors[clusterId];
    const span = sector.end - sector.start;
    nodes.forEach((n, idx) => {
      const [w, h] = nodeSize(n, false, measured);
      const ring = n.ring ?? (idx % 2 === 0 ? 0 : 1);
      let radius: number;
      let angle: number;
      if (clusterId === 'core') {
        radius = rnd.range(230, 300);
        angle = rnd.range(0, Math.PI * 2);
      } else {
        const base = ring === 0 ? 380 : ring === 1 ? 640 : 880;
        radius = base + rnd.range(-70, 70);
        const t = (idx + 0.5) / nodes.length;
        angle = sector.start + span * t + rnd.range(-span * 0.18, span * 0.18);
      }
      boxes.push({ id: n.id, cx: Math.cos(angle) * radius, cy: Math.sin(angle) * radius * 0.78, w, h, fixed: false });
      rotations[n.id] = rnd.range(-4, 4);
    });
  }

  relax(boxes, -14, 120);
  return toLayout(boxes, rotations);
}

/** Layout radial « rangé » : anneaux réguliers par cluster, aucune rotation. */
export function tidyLayout(map: Mindmap, measured?: MeasuredSizes): Layout {
  const sectors = buildSectors(map, -Math.PI / 2);
  const boxes: Box[] = [];
  const rotations: Record<string, number> = {};
  const perCluster = new Map<ClusterId, MindmapNode[]>();

  for (const n of map.nodes) {
    if (n.id === map.rootId) continue;
    const list = perCluster.get(n.cluster) ?? [];
    list.push(n);
    perCluster.set(n.cluster, list);
  }

  const root = map.nodes.find((n) => n.id === map.rootId);
  if (root) {
    const [w, h] = nodeSize(root, true, measured);
    boxes.push({ id: root.id, cx: 0, cy: 0, w, h, fixed: true });
    rotations[root.id] = 0;
  }

  for (const [clusterId, nodes] of Array.from(perCluster.entries())) {
    const sector = sectors[clusterId];
    const span = sector.end - sector.start;
    if (clusterId === 'core') {
      nodes.forEach((n, idx) => {
        const [w, h] = nodeSize(n, false, measured);
        const angle = -Math.PI / 2 + (idx / Math.max(nodes.length, 1)) * Math.PI * 2;
        boxes.push({ id: n.id, cx: Math.cos(angle) * 300, cy: Math.sin(angle) * 220, w, h, fixed: false });
        rotations[n.id] = 0;
      });
      continue;
    }
    const inner = nodes.filter((n, i) => (n.ring ?? (i % 2 === 0 ? 0 : 1)) === 0);
    const outer = nodes.filter((n, i) => (n.ring ?? (i % 2 === 0 ? 0 : 1)) !== 0);
    const place = (list: MindmapNode[], radius: number) => {
      list.forEach((n, idx) => {
        const [w, h] = nodeSize(n, false, measured);
        const t = (idx + 0.5) / list.length;
        const angle = sector.start + span * t;
        boxes.push({ id: n.id, cx: Math.cos(angle) * radius, cy: Math.sin(angle) * radius * 0.8, w, h, fixed: false });
        rotations[n.id] = 0;
      });
    };
    place(inner, 520);
    place(outer, 860);
  }

  relax(boxes, 28, 160);
  return toLayout(boxes, rotations);
}

export function computeLayout(map: Mindmap, mode: LayoutMode, measured?: MeasuredSizes): Layout {
  return mode === 'scatter' ? scatterLayout(map, measured) : tidyLayout(map, measured);
}
