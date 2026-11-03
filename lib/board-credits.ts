import credits from '@/public/board/credits.json';

export interface BoardCredit {
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  width: number;
  height: number;
  alt: string;
  /** Fichier brut (photo) ou détouré (PNG) disponible en local. */
  file: string;
}

interface CreditsFile {
  generatedAt: string | null;
  images: Record<string, BoardCredit>;
}

const data = credits as CreditsFile;

export function getBoardCredit(id: string): BoardCredit | undefined {
  return data.images[id];
}
