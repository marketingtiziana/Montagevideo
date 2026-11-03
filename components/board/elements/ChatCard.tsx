'use client';

import type { ChatElement } from '@/data/board';
import Shell from './Shell';

/** Conversation type messagerie : bulles sortantes, aucun logo de marque. */
export default function ChatCard({ el }: { el: ChatElement }) {
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#EFE7DC' }}>
      <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[12px] font-bold">
          {el.title.charAt(0)}
        </span>
        <span className="text-[13px] font-semibold">{el.title}</span>
        <span className="ml-auto flex gap-0.5">
          <span className="h-1 w-1 rounded-full bg-white/80" />
          <span className="h-1 w-1 rounded-full bg-white/80" />
          <span className="h-1 w-1 rounded-full bg-white/80" />
        </span>
      </div>
      <div className="flex flex-col items-end gap-2 px-3 py-3">
        {el.messages.map((m) => (
          <div
            key={m}
            className="relative max-w-[88%] rounded-xl rounded-tr-sm bg-[#DCF8C6] px-3 py-2 text-[13px] leading-snug text-[#1F2A1F]"
            style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}
          >
            {m}
            <span className="ml-2 inline-block align-middle text-[10px] text-[#53BDEB]">✓✓</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
