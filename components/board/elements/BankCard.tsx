'use client';

import type { BankElement } from '@/data/board';
import Shell from './Shell';

/** Faux écran bancaire : un seul compte, opérations mélangées, montants masqués. */
export default function BankCard({ el }: { el: BankElement }) {
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#F4F5F8' }}>
      <div className="bg-[#111827] px-4 pb-4 pt-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{el.title}</span>
          <span className="h-5 w-8 rounded-sm bg-white/20" />
        </div>
        <p className="mt-2 text-[15px] font-bold">{el.accountLabel}</p>
        <div className="mt-2 h-4 w-28 rounded bg-white/25" />
      </div>
      <ul className="divide-y divide-[#E5E7EB] bg-white">
        {el.lines.map((line, i) => (
          <li key={`${line.label}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
              style={{
                background: line.kind === 'in' ? '#DCFCE7' : '#FEE2E2',
                color: line.kind === 'in' ? '#15803D' : '#B91C1C',
              }}
            >
              {line.kind === 'in' ? '+' : '−'}
            </span>
            <span className="flex-1 text-[13px] text-[#111827]">{line.label}</span>
            <span className="h-3 w-14 rounded bg-[#E5E7EB]" aria-hidden />
          </li>
        ))}
      </ul>
    </Shell>
  );
}
