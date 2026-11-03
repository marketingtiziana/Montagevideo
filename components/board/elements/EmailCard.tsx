'use client';

import { Send, MailX } from 'lucide-react';
import type { EmailElement } from '@/data/board';
import Shell from './Shell';

/** Faux fil d’emails envoyés, sans réponse. */
export default function EmailCard({ el }: { el: EmailElement }) {
  return (
    <Shell width={el.width} overlays={el.overlays}>
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-2.5">
        <Send size={14} className="text-[#6B7280]" aria-hidden />
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{el.title}</span>
      </div>
      <ul className="divide-y divide-[#F1F3F6]">
        {el.items.map((item, i) => (
          <li key={`${item.subject}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#9CA3AF]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[#111827]">{item.subject}</span>
              <span className="mt-0.5 block h-1.5 w-2/3 rounded bg-[#E5E7EB]" />
            </span>
            <span className="shrink-0 text-[11px] text-[#6B7280]">{item.time}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 bg-[#FFF5F5] px-4 py-2.5 text-[12px] font-bold text-[#B91C1C]">
        <MailX size={14} aria-hidden />
        {el.note}
      </div>
    </Shell>
  );
}
