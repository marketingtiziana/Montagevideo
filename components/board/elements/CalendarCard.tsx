'use client';

import type { CalendarElement } from '@/data/board';
import { useBoard } from '@/components/board/BoardContext';
import { createRandom } from '@/lib/random';
import { hashSeed } from '@/lib/random';
import Shell from './Shell';

const COLS = 7;
const ROWS = 5;

/** Faux calendrier d’une année : douze mois en grilles de points (sans numéros), points de suivi en vert. */
export default function CalendarCard({ el }: { el: CalendarElement }) {
  const board = useBoard();
  const green = board.lines.right.color;
  const rnd = createRandom(hashSeed(el.id));
  // Position (déterministe) du point de suivi dans chaque mois marqué.
  const markCell = new Map<number, number>();
  for (const m of el.marks) markCell.set(m, rnd.int(COLS + 2, COLS * ROWS - 3));

  return (
    <Shell width={el.width} overlays={el.overlays}>
      <div className="border-b border-[#E5E7EB] px-4 py-2.5">
        <p className="text-[13px] font-black tracking-tight text-[#111827]">{el.title}</p>
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-3 px-4 py-3">
        {el.months.map((month, mi) => {
          const cell = markCell.get(mi);
          return (
            <div key={month}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">{month}</p>
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {Array.from({ length: COLS * ROWS }).map((_, i) => {
                  const marked = cell === i;
                  return (
                    <span
                      key={i}
                      className="block aspect-square rounded-full"
                      style={marked ? { background: green, boxShadow: `0 0 0 2px ${green}33` } : { background: '#E5E7EB' }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#374151]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: green }} />
        {el.legend}
      </div>
    </Shell>
  );
}
