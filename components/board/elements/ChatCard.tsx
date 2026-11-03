'use client';

import type { ChatElement, ChatMessage } from '@/data/board';
import Shell from './Shell';

const SENDER_COLORS = ['#B45309', '#1D4ED8', '#7C3AED', '#0F766E'];

function normalize(m: ChatMessage) {
  return typeof m === 'string' ? { text: m, dir: 'out' as const, from: undefined, time: undefined } : { dir: 'out' as const, ...m };
}

/** Conversation type messagerie : bulles sortantes ou entrantes, groupe avec expéditeurs. Aucun logo de marque. */
export default function ChatCard({ el }: { el: ChatElement }) {
  const senders = Array.from(new Set(el.messages.map((m) => normalize(m).from).filter(Boolean))) as string[];
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#EFE7DC' }}>
      <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[12px] font-bold">
          {el.title.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold leading-tight">{el.title}</span>
          {el.subtitle && <span className="block text-[10px] leading-tight text-white/70">{el.subtitle}</span>}
        </span>
        <span className="ml-auto flex gap-0.5">
          <span className="h-1 w-1 rounded-full bg-white/80" />
          <span className="h-1 w-1 rounded-full bg-white/80" />
          <span className="h-1 w-1 rounded-full bg-white/80" />
        </span>
      </div>
      <div className="flex flex-col gap-2 px-3 py-3">
        {el.messages.map((raw, i) => {
          const m = normalize(raw);
          const out = m.dir === 'out';
          const senderColor = m.from ? SENDER_COLORS[senders.indexOf(m.from) % SENDER_COLORS.length] : undefined;
          return (
            <div key={`${m.text}-${i}`} className={`flex ${out ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-snug text-[#1F2A1F] ${
                  out ? 'rounded-tr-sm bg-[#DCF8C6]' : 'rounded-tl-sm bg-white'
                }`}
                style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}
              >
                {m.from && (
                  <span className="mb-0.5 block text-[11px] font-bold" style={{ color: senderColor }}>
                    {m.from}
                  </span>
                )}
                {m.text}
                <span className="ml-2 inline-flex items-center gap-1 align-middle text-[10px] text-[#6B7280]">
                  {m.time && <span>{m.time}</span>}
                  {out && <span className="text-[#53BDEB]">✓✓</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
