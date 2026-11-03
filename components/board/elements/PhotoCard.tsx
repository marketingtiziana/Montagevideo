'use client';

import type { PhotoElement } from '@/data/board';
import BoardImage from '@/components/board/BoardImage';
import Shell from './Shell';

/** Photo dans un cadre blanc, coins arrondis. */
export default function PhotoCard({ el }: { el: PhotoElement }) {
  const inner = el.width - 20;
  return (
    <Shell width={el.width} overlays={el.overlays}>
      <div className="p-2.5">
        <BoardImage id={el.image} width={inner} ratio={el.ratio} className="rounded-lg" sizes={`${inner}px`} />
      </div>
    </Shell>
  );
}
