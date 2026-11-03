'use client';

import { PhoneMissed, Phone } from 'lucide-react';
import type { CallElement } from '@/data/board';
import Shell from './Shell';

/** Faux écran d’appel : appel manqué, cabinet injoignable, bouton rappeler grisé. */
export default function CallCard({ el }: { el: CallElement }) {
  return (
    <Shell width={el.width} overlays={el.overlays} style={{ background: '#111827' }}>
      <div className="flex flex-col items-center px-5 pb-5 pt-6 text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[20px] font-bold">
          {el.name.charAt(0)}
        </span>
        <p className="mt-3 text-[16px] font-bold">{el.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-[#F87171]">
          <PhoneMissed size={14} aria-hidden />
          {el.status}
        </p>
        <p className="mt-0.5 text-[11px] text-white/60">{el.detail}</p>
        <button
          type="button"
          disabled
          className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-[13px] font-semibold text-white/40"
          tabIndex={-1}
        >
          <Phone size={14} aria-hidden />
          {el.action}
        </button>
      </div>
    </Shell>
  );
}
