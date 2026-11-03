'use client';

import { memo, useMemo } from 'react';
import { EdgeLabelRenderer, useInternalNode, type EdgeProps, type InternalNode } from '@xyflow/react';
import type { FlowEdge } from '@/components/mindmap/graph';
import { roughArrowPaths, roughCurvePaths } from '@/lib/rough';
import { createRandom } from '@/lib/random';

interface Point {
  x: number;
  y: number;
}

function center(node: InternalNode): Point & { w: number; h: number } {
  const w = node.measured.width ?? 200;
  const h = node.measured.height ?? 120;
  return { x: node.internals.positionAbsolute.x + w / 2, y: node.internals.positionAbsolute.y + h / 2, w, h };
}

/** Point d'intersection entre le bord du rectangle d'un nœud et la droite vers `toward`. */
function boundary(node: ReturnType<typeof center>, toward: Point, inset = 6): Point {
  const dx = toward.x - node.x;
  const dy = toward.y - node.y;
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
  const hw = node.w / 2 - inset;
  const hh = node.h / 2 - inset;
  const scale = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: node.x + dx * scale, y: node.y + dy * scale };
}

function RoughEdge({ id, source, target, data }: EdgeProps<FlowEdge>) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const geometry = useMemo(() => {
    if (!sourceNode || !targetNode || !data) return null;
    const sc = center(sourceNode);
    const tc = center(targetNode);
    const start = boundary(sc, tc);
    const end = boundary(tc, sc);
    const rnd = createRandom(data.seed);
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    // Courbure perpendiculaire, proportionnelle à la longueur, signe déterministe.
    const bow = (rnd.next() > 0.5 ? 1 : -1) * Math.min(90, len * 0.18) * rnd.range(0.6, 1.1);
    const cx = mx + (-dy / len) * bow;
    const cy = my + (dx / len) * bow;
    const d = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
    const labelX = 0.25 * start.x + 0.5 * cx + 0.25 * end.x;
    const labelY = 0.25 * start.y + 0.5 * cy + 0.25 * end.y;
    const angle = Math.atan2(end.y - cy, end.x - cx);
    const curve = roughCurvePaths(d, { seed: data.seed, stroke: data.color, strokeWidth: 2.2 });
    const arrow = roughArrowPaths(end.x, end.y, angle, { seed: data.seed + 7, stroke: data.color, strokeWidth: 2.2 });
    return { curve, arrow, labelX, labelY };
  }, [sourceNode, targetNode, data]);

  if (!geometry || !data) return null;

  return (
    <>
      <g className="react-flow__edge-path" data-id={id} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
        {geometry.curve.map((p, i) => (
          <path key={`c${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" />
        ))}
        {geometry.arrow.map((p, i) => (
          <path key={`a${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" />
        ))}
      </g>
      {data.label && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded-full border bg-white px-2 py-0.5 text-[11px] font-semibold shadow-soft"
            style={{
              transform: `translate(-50%, -50%) translate(${geometry.labelX}px, ${geometry.labelY}px)`,
              borderColor: data.color,
              color: data.ink,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(RoughEdge);
