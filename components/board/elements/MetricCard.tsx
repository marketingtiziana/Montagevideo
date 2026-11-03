'use client';

import type { MetricElement } from '@/data/board';
import { useBoard } from '@/components/board/BoardContext';
import Shell from './Shell';

export default function MetricCard({ el }: { el: MetricElement }) {
  const board = useBoard();
  const color = el.tone === 'red' ? board.lines.left.color : board.lines.right.color;
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ border: `2px solid ${color}` }}>
      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{el.label}</p>
        <p
          className={`mt-1 font-black tracking-tight ${el.value.length > 12 ? 'text-[18px] leading-snug' : 'text-[34px] leading-none'}`}
          style={{ color }}
        >
          {el.value}
        </p>
      </div>
    </Shell>
  );
}
