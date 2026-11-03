'use client';

import type { DocElement } from '@/data/board';
import { useBoard } from '@/components/board/BoardContext';
import Shell from './Shell';

/** Faux document : en-tête, lignes, tampon. */
export default function DocCard({ el }: { el: DocElement }) {
  const board = useBoard();
  const stampColor = board.lines.right.color;
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#FFFFFF' }}>
      <div className="relative px-6 pb-7 pt-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0F1535] text-[11px] font-black text-white">
              {el.letterhead}
            </span>
            <span className="h-2 w-24 rounded bg-[#E5E7EB]" />
          </div>
          <span className="h-2 w-12 rounded bg-[#E5E7EB]" />
        </div>
        <h3 className="mt-4 text-[20px] font-black tracking-tight text-[#111827]">{el.title}</h3>
        <ul className="mt-3 space-y-2">
          {el.lines.map((line) => (
            <li key={line} className="flex gap-2 text-[13px] leading-snug text-[#374151]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111827]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1.5">
          <span className="block h-1.5 w-3/4 rounded bg-[#EEF0F3]" />
          <span className="block h-1.5 w-1/2 rounded bg-[#EEF0F3]" />
        </div>
        <div
          className="absolute bottom-6 right-6 rounded-md border-[3px] px-3 py-1 text-[14px] font-black uppercase tracking-[0.18em]"
          style={{ color: stampColor, borderColor: stampColor, transform: 'rotate(-10deg)', opacity: 0.85 }}
        >
          {el.stamp}
        </div>
      </div>
    </Shell>
  );
}
