import { board as boardLlc } from '@/data/board';
import { boardPeur } from '@/data/board-peur';
import { boardAccompagnement } from '@/data/board-accompagnement';
import type { Board, BoardImage } from '@/data/board';

/** Registre des boards (une route et un fichier de données par board). */
export const BOARDS = {
  llc: boardLlc,
  peur: boardPeur,
  accompagnement: boardAccompagnement,
} as const satisfies Record<string, Board>;

export type BoardId = keyof typeof BOARDS;

/** Toutes les images de tous les boards, dédoublonnées par identifiant (dossier public/board partagé). */
export function allBoardImages(): BoardImage[] {
  const seen = new Map<string, BoardImage>();
  for (const b of Object.values(BOARDS)) {
    for (const img of b.images) if (!seen.has(img.id)) seen.set(img.id, img);
  }
  return Array.from(seen.values());
}
