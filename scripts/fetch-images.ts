/**
 * Télécharge les photos des nœuds `photo` depuis l'API Pexels.
 *
 *   PEXELS_API_KEY=... pnpm fetch-images [--force]
 *
 * Pour chaque nœud `photo` de `data/mindmap.ts`, recherche `imageQuery`, prend la première image
 * paysage pertinente (taille medium), l'enregistre dans `public/mindmap/<id>.jpg` et met à jour
 * `public/mindmap/credits.json` (photographe + URL). Les photos sont ensuite servies en local :
 * aucun appel à l'API au runtime.
 *
 * Sans clé : le script s'arrête proprement (code 0), le board affiche un bloc couleur + icône.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { mindmap } from '../data/mindmap';
import type { PhotoNodeData } from '../data/types';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: { medium: string; large: string; original: string };
}

interface PexelsSearch {
  photos: PexelsPhoto[];
}

interface Credit {
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  width: number;
  height: number;
  alt: string;
}

interface CreditsFile {
  generatedAt: string | null;
  images: Record<string, Credit>;
}

const API_URL = process.env.PEXELS_API_URL ?? 'https://api.pexels.com/v1/search';
const OUT_DIR = path.join(process.cwd(), 'public', 'mindmap');
const CREDITS_PATH = path.join(OUT_DIR, 'credits.json');
const FORCE = process.argv.includes('--force');

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readCredits(): Promise<CreditsFile> {
  try {
    const raw = await readFile(CREDITS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CreditsFile>;
    return { generatedAt: parsed.generatedAt ?? null, images: parsed.images ?? {} };
  } catch {
    return { generatedAt: null, images: {} };
  }
}

async function search(apiKey: string, query: string): Promise<PexelsPhoto | null> {
  const url = new URL(API_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('size', 'medium');
  url.searchParams.set('per_page', '8');
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels ${res.status} ${res.statusText} pour « ${query} »`);
  const data = (await res.json()) as PexelsSearch;
  // Première image réellement paysage (l'API peut renvoyer des formats proches du carré).
  return data.photos.find((p) => p.width > p.height) ?? data.photos[0] ?? null;
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status}) : ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
  return buffer.length;
}

async function main() {
  const apiKey = process.env.PEXELS_API_KEY;
  const photos = mindmap.nodes.filter((n): n is PhotoNodeData => n.kind === 'photo');

  if (!apiKey) {
    console.log(`PEXELS_API_KEY absente : ${photos.length} nœud(s) photo utiliseront le bloc de repli (couleur + icône).`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  const credits = await readCredits();
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const node of photos) {
    const dest = path.join(OUT_DIR, `${node.id}.jpg`);
    if (!FORCE && credits.images[node.id] && (await exists(dest))) {
      skipped += 1;
      console.log(`= ${node.id} : déjà présent`);
      continue;
    }
    try {
      const photo = await search(apiKey, node.imageQuery);
      if (!photo) {
        failed += 1;
        console.warn(`? ${node.id} : aucun résultat pour « ${node.imageQuery} »`);
        continue;
      }
      const bytes = await download(photo.src.medium, dest);
      credits.images[node.id] = {
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.alt || node.caption,
      };
      fetched += 1;
      console.log(`+ ${node.id} : ${photo.photographer} (${Math.round(bytes / 1024)} Ko)`);
      // Respect du rythme de l'API.
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      failed += 1;
      console.warn(`! ${node.id} : ${(err as Error).message}`);
    }
  }

  credits.generatedAt = new Date().toISOString();
  await writeFile(CREDITS_PATH, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`\n${fetched} téléchargée(s), ${skipped} conservée(s), ${failed} en échec. Crédits : public/mindmap/credits.json`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
