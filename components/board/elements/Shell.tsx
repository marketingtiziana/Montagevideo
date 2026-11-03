'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Overlay } from '@/data/board';
import BoardImage from '@/components/board/BoardImage';

interface ShellProps {
  width: number;
  overlays?: Overlay[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Enveloppe commune : largeur fixe, coins arrondis, ombre douce, détourés posés par-dessus. */
export default function Shell({ width, overlays, className, style, children }: ShellProps) {
  return (
    <div className="relative" style={{ width }}>
      <div
        className={`overflow-hidden rounded-xl bg-white ${className ?? ''}`}
        style={{ boxShadow: '0 10px 28px -10px rgba(20, 24, 40, 0.28), 0 2px 6px -2px rgba(20, 24, 40, 0.12)', ...style }}
      >
        {children}
      </div>
      {overlays?.map((o) => (
        <div
          key={o.image}
          className="pointer-events-none absolute"
          style={{ left: o.x, top: o.y, width: o.width, transform: o.rotate ? `rotate(${o.rotate}deg)` : undefined }}
        >
          <BoardImage id={o.image} width={o.width} />
        </div>
      ))}
    </div>
  );
}
