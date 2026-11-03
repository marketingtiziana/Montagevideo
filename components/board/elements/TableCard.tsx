'use client';

import type { TableElement } from '@/data/board';
import { board } from '@/data/board';
import Shell from './Shell';

/** Petit tableau : une ou deux colonnes, lignes alternées. */
export default function TableCard({ el }: { el: TableElement }) {
  const accent = el.side === 'left' ? board.lines.left.color : board.lines.right.color;
  return (
    <Shell width={el.width} overlays={el.overlays}>
      {el.title && (
        <div className="border-b border-[#E5E7EB] px-4 py-2.5">
          <p className="text-[13px] font-black tracking-tight text-[#111827]">{el.title}</p>
        </div>
      )}
      <table className="w-full border-collapse text-[13px]">
        <tbody>
          {el.rows.map((row, i) => (
            <tr key={row.join('|')} style={{ background: i % 2 === 1 ? '#F7F8FA' : '#FFFFFF' }}>
              {row.map((cell, j) => (
                <td
                  key={`${i}-${j}`}
                  className={`px-4 py-2 align-top leading-snug ${j === 0 ? 'text-[#111827]' : 'text-right font-bold'}`}
                  style={j > 0 ? { color: accent, borderLeft: '1px solid #E5E7EB' } : undefined}
                >
                  {j === 0 && row.length === 1 && (
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: accent }} />
                  )}
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}
