'use client';

import Image from 'next/image';
import { board } from '@/data/board';
import { getBoardCredit } from '@/lib/board-credits';

interface BoardImageProps {
  id: string;
  /** Largeur du cadre en px (hauteur déduite du ratio ou de l’image). */
  width: number;
  ratio?: number;
  className?: string;
  sizes?: string;
}

/**
 * Photo ou détouré servi en local (public/board/raw ou public/board/cutouts).
 * Sans fichier téléchargé : rectangle gris avec le nom de l’image.
 */
export default function BoardImage({ id, width, ratio, className, sizes }: BoardImageProps) {
  const meta = board.images.find((i) => i.id === id);
  const credit = getBoardCredit(id);
  const alt = meta?.alt ?? id;
  const isCutout = Boolean(meta?.cutout);

  if (!credit) {
    const height = ratio ? width / ratio : width * 0.75;
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-[#D9DCE3] text-center text-[12px] font-semibold text-[#5B6474] ${className ?? ''}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        {alt}
      </div>
    );
  }

  if (isCutout) {
    const height = (width * credit.height) / credit.width;
    return (
      <Image
        src={`/board/${credit.file}`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes ?? `${width}px`}
        className={className}
        style={{ filter: 'drop-shadow(0 10px 14px rgba(20, 24, 40, 0.28))' }}
        draggable={false}
      />
    );
  }

  const height = ratio ? width / ratio : (width * credit.height) / credit.width;
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={{ width, height }}>
      <Image src={`/board/${credit.file}`} alt={alt} fill sizes={sizes ?? `${width}px`} className="object-cover" draggable={false} />
    </div>
  );
}
