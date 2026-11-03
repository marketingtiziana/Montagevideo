'use client';

import type { FlowElement } from '@/data/board';
import { useBoard } from '@/components/board/BoardContext';
import Shell from './Shell';

/** Faux écran d’automatisation : six nœuds reliés, en deux rangées. */
export default function FlowCard({ el }: { el: FlowElement }) {
  const board = useBoard();
  const accent = board.lines.right.color;
  const rows = [el.steps.slice(0, 3), el.steps.slice(3)];
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#1E2235' }}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </span>
        <span className="text-[12px] font-semibold text-white/80">{el.title}</span>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: accent, color: '#0B1F14' }}>
          Actif
        </span>
      </div>
      <div
        className="px-4 py-4"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
      >
        {rows.map((row, r) => (
          <div key={r} className={`flex items-stretch gap-2 ${r > 0 ? 'mt-3' : ''}`}>
            {row.map((step, i) => (
              <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-2.5 py-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
                  <span className="text-[11px] font-semibold leading-tight text-white">{step}</span>
                </div>
                {i < row.length - 1 && <span className="text-[14px] text-white/50">→</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Shell>
  );
}
