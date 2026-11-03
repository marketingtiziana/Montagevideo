/**
 * Télécharge les images de banque d’images depuis l’API Pexels, pour deux collections :
 *
 *   PEXELS_API_KEY=... pnpm fetch-images [mindmap|board|all] [--force]
 *
 * - mindmap : nœuds `photo` de `data/mindmap.ts` → public/mindmap/<id>.jpg (taille medium) + credits.json
 * - board   : photos et détourés de `data/board.ts` → public/board/raw/<id>.jpg (taille large) + credits.json
 *   (les images `cutout: true` sont ensuite détourées par `scripts/cutout.ts`)
 *
 * Les images sont servies en local : aucun appel à l’API au runtime.
 * Sans clé : le script s’arrête proprement (code 0), les pages affichent un bloc de repli.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { mindmap } from '../data/mindmap';
import { board } from '../data/board';
import type { PhotoNodeData } from '../data/types';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: { medium: string; large: string; large2x: string; original: string };
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
  /** Chemin relatif au dossier public de la collection (board uniquement). */
  file?: string;
}

interface CreditsFile {
  generatedAt: string | null;
  images: Record<string, Credit>;
}

interface Item {
  id: string;
  query: string;
  alt: string;
  size: 'medium' | 'large';
  /** Chemin de destination relatif à `dir`. */
  file: string;
}

interface Collection {
  name: string;
  dir: string;
  items: Item[];
  /** Renseigne `file` dans credits.json (nécessaire au board). */
  trackFile: boolean;
}

const API_URL = process.env.PEXELS_API_URL ?? 'https://api.pexels.com/v1/search';
const FORCE = process.argv.includes('--force');
const WHICH = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'all';

function collections(): Collection[] {
  const mm: Collection = {
    name: 'mindmap',
    dir: path.join(process.cwd(), 'public', 'mindmap'),
    trackFile: false,
    items: mindmap.nodes
      .filter((n): n is PhotoNodeData => n.kind === 'photo')
      .map((n) => ({ id: n.id, query: n.imageQuery, alt: n.caption, size: 'medium', file: `${n.id}.jpg` })),
  };
  const bd: Collection = {
    name: 'board',
    dir: path.join(process.cwd(), 'public', 'board'),
    trackFile: true,
    items: board.images.map((i) => ({ id: i.id, query: i.imageQuery, alt: i.alt, size: 'large', file: `raw/${i.id}.jpg` })),
  };
  if (WHICH === 'mindmap') return [mm];
  if (WHICH === 'board') return [bd];
  return [mm, bd];
}

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readCredits(file: string): Promise<CreditsFile> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<CreditsFile>;
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
  // Première image réellement paysage (l’API peut renvoyer des formats proches du carré).
  return data.photos.find((p) => p.width > p.height) ?? data.photos[0] ?? null;
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status}) : ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buffer);
  return buffer.length;
}

async function run(apiKey: string, col: Collection) {
  await mkdir(col.dir, { recursive: true });
  const creditsPath = path.join(col.dir, 'credits.json');
  const credits = await readCredits(creditsPath);
  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  console.log(`\n[${col.name}] ${col.items.length} image(s)`);

  for (const item of col.items) {
    const dest = path.join(col.dir, item.file);
    if (!FORCE && credits.images[item.id] && (await exists(dest))) {
      skipped += 1;
      console.log(`= ${item.id} : déjà présent`);
      continue;
    }
    try {
      const photo = await search(apiKey, item.query);
      if (!photo) {
        failed += 1;
        console.warn(`? ${item.id} : aucun résultat pour « ${item.query} »`);
        continue;
      }
      const bytes = await download(item.size === 'large' ? photo.src.large : photo.src.medium, dest);
      credits.images[item.id] = {
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.alt || item.alt,
        ...(col.trackFile ? { file: item.file } : {}),
      };
      fetched += 1;
      console.log(`+ ${item.id} : ${photo.photographer} (${Math.round(bytes / 1024)} Ko)`);
      // Respect du rythme de l’API.
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      failed += 1;
      console.warn(`! ${item.id} : ${(err as Error).message}`);
    }
  }

  credits.generatedAt = new Date().toISOString();
  await writeFile(creditsPath, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`${fetched} téléchargée(s), ${skipped} conservée(s), ${failed} en échec. Crédits : ${path.relative(process.cwd(), creditsPath)}`);
  return failed;
}

async function main() {
  const apiKey = process.env.PEXELS_API_KEY;
  const cols = collections();
  if (!apiKey) {
    const total = cols.reduce((acc, c) => acc + c.items.length, 0);
    console.log(`PEXELS_API_KEY absente : ${total} image(s) utiliseront le bloc de repli.`);
    return;
  }
  let failed = 0;
  for (const col of cols) failed += await run(apiKey, col);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
