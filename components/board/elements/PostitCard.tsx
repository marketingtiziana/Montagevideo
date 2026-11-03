'use client';

import type { PostitElement } from '@/data/board';
import Shell from './Shell';

const TINTS = { yellow: '#FFF3A6', orange: '#FFD8A8', green: '#D9F4DF' } as const;

export default function PostitCard({ el }: { el: PostitElement }) {
  return (
    <Shell
      width={el.width}
      overlays={el.overlays}
      className="rounded-md"
      style={{ background: TINTS[el.tint], boxShadow: '0 12px 24px -10px rgba(20, 24, 40, 0.35), 0 2px 4px rgba(20,24,40,0.08)' }}
    >
      <div className="h-3 w-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
      <p
        className={`px-5 pb-6 pt-4 font-bold leading-snug text-[#2B2B1F] ${el.size === 'lg' ? 'text-[22px]' : 'text-[16px]'}`}
      >
        {el.text}
      </p>
    </Shell>
  );
}
