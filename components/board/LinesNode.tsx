'use client';

import { memo } from 'react';
import { useNodes } from '@xyflow/react';
import { board } from '@/data/board';
import type { BoardNode } from './graph';
import { roughCurvePaths } from '@/lib/rough';
import { hashSeed } from '@/lib/random';

/**
 * Couche de fond : les deux lignes verticales (rouge, verte) et les petits traits
 * qui relient les éléments à leur ligne. Suit les éléments quand on les déplace.
 */
function LinesNode() {
  const nodes = useNodes<BoardNode>();
  const { left, right } = board.lines;
  const minX = Math.min(left.x, right.x) - 400;
  const maxX = Math.max(left.x, right.x) + 400;
  const top = Math.min(left.top, right.top);
  const bottom = Math.max(left.bottom, right.bottom);
  const width = maxX - minX;
  const height = bottom - top;

  const ticks = nodes.flatMap((n) => {
    if (n.type !== 'element') return [];
    const el = n.data.el;
    if (!el.tick) return [];
    const w = n.measured?.width ?? el.width;
    const h = n.measured?.height ?? 120;
    const line = board.lines[el.side];
    const cy = n.position.y + Math.min(h * 0.35, 70);
    const cx = n.position.x + w / 2;
    // Le trait part du bord de l’élément le plus proche de la ligne.
    const fromX = cx < line.x ? n.position.x + w : n.position.x;
    if (Math.abs(fromX - line.x) < 4) return [];
    return [{ id: n.id, x1: fromX, x2: line.x, y: cy, color: line.color }];
  });

  const lineFor = (key: 'left' | 'right') => {
    const l = board.lines[key];
    return roughCurvePaths(`M ${l.x} ${l.top} L ${l.x} ${l.bottom}`, {
      seed: hashSeed(`line-${key}`),
      stroke: l.color,
      strokeWidth: 2.2,
      roughness: 0.6,
    });
  };

  return (
    <div className="pointer-events-none" style={{ width, height, transform: `translate(${minX}px, ${top}px)` }}>
      <svg viewBox={`${minX} ${top} ${width} ${height}`} width={width} height={height} className="overflow-visible">
        {(['left', 'right'] as const).map((key) =>
          lineFor(key).map((p, i) => (
            <path key={`${key}-${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" />
          )),
        )}
        {ticks.map((t) => (
          <line key={t.id} x1={t.x1} y1={t.y} x2={t.x2} y2={t.y} stroke={t.color} strokeWidth={1.6} strokeLinecap="round" opacity={0.9} />
        ))}
        {(['left', 'right'] as const).map((key) => {
          const l = board.lines[key];
          return (
            <g key={`label-${key}`} transform={`translate(${l.x} ${l.top - 18})`}>
              <text
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={l.color}
                letterSpacing="0.08em"
                style={{ textTransform: 'uppercase' }}
              >
                {l.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(LinesNode);
