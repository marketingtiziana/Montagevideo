'use client';

import Image from 'next/image';
import type { MemeElement } from '@/data/board';
import Shell from './Shell';

/** Emplacement mème : image locale de public/board/memes/ si renseignée, sinon cadre vide. */
export default function MemeCard({ el }: { el: MemeElement }) {
  const height = Math.round(el.width * 0.8);
  if (!el.src) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#C9CED8] text-[13px] font-semibold text-[#8A93A6]"
        style={{ width: el.width, height, background: 'rgba(255,255,255,0.5)' }}
      >
        {el.placeholder}
      </div>
    );
  }
  return (
    <Shell width={el.width} overlays={el.overlays}>
      <div className="relative" style={{ width: el.width, height }}>
        <Image src={`/board/memes/${el.src}`} alt={el.placeholder} fill sizes={`${el.width}px`} className="object-cover" unoptimized draggable={false} />
      </div>
    </Shell>
  );
}
