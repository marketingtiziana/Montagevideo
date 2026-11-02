import credits from '@/public/mindmap/credits.json';

export interface ImageCredit {
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  width: number;
  height: number;
  alt: string;
}

interface CreditsFile {
  generatedAt: string | null;
  images: Record<string, ImageCredit>;
}

const data = credits as CreditsFile;

/** Retourne le crédit d'une photo si elle a été téléchargée par `scripts/fetch-images.ts`. */
export function getImageCredit(id: string): ImageCredit | undefined {
  return data.images[id];
}

export function hasLocalImage(id: string): boolean {
  return Boolean(data.images[id]);
}
