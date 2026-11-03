/**
 * Détoure en local les images du board marquées `cutout: true` (data/board.ts) :
 *
 *   pnpm cutout [--force]
 *
 * Entrée : public/board/raw/<id>.jpg (téléchargé par `pnpm fetch-images board`).
 * Sortie : public/board/cutouts/<id>.png, et `file` mis à jour dans public/board/credits.json.
 *
 * Moteur, au choix :
 *   - la commande `rembg` si elle est installée (pip install "rembg[cli]") ;
 *   - sinon le paquet `@imgly/background-removal-node` (pnpm add -D @imgly/background-removal-node).
 * Aucun appel réseau à part le téléchargement initial des modèles de ces outils.
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { board } from '../data/board';

interface Credit {
  file?: string;
  [key: string]: unknown;
}

interface CreditsFile {
  generatedAt: string | null;
  images: Record<string, Credit>;
}

const DIR = path.join(process.cwd(), 'public', 'board');
const CREDITS = path.join(DIR, 'credits.json');
const FORCE = process.argv.includes('--force');

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function hasRembg(): boolean {
  const res = spawnSync('rembg', ['--version'], { stdio: 'ignore' });
  return !res.error && res.status === 0;
}

type Remover = (input: string, output: string) => Promise<void>;

async function pickRemover(): Promise<Remover> {
  if (hasRembg()) {
    console.log('Moteur : rembg (CLI)');
    return async (input, output) => {
      const res = spawnSync('rembg', ['i', input, output], { stdio: 'inherit' });
      if (res.status !== 0) throw new Error(`rembg a échoué pour ${path.basename(input)}`);
    };
  }
  // Import dynamique par nom de variable : le paquet est optionnel et absent du typage.
  const moduleName = '@imgly/background-removal-node';
  try {
    const mod = (await import(moduleName)) as { removeBackground: (src: string) => Promise<Blob> };
    console.log('Moteur : @imgly/background-removal-node');
    return async (input, output) => {
      const blob = await mod.removeBackground(input);
      await writeFile(output, Buffer.from(await blob.arrayBuffer()));
    };
  } catch {
    throw new Error(
      'Aucun moteur de détourage disponible. Installer `rembg` (pip install "rembg[cli]") ou `@imgly/background-removal-node` (pnpm add -D @imgly/background-removal-node).',
    );
  }
}

async function main() {
  const items = board.images.filter((i) => i.cutout);
  const credits = JSON.parse(await readFile(CREDITS, 'utf8')) as CreditsFile;
  const todo = [];
  for (const item of items) {
    const input = path.join(DIR, 'raw', `${item.id}.jpg`);
    const output = path.join(DIR, 'cutouts', `${item.id}.png`);
    if (!(await exists(input))) {
      console.warn(`? ${item.id} : image brute absente (lancer d’abord pnpm fetch-images board)`);
      continue;
    }
    if (!FORCE && (await exists(output)) && credits.images[item.id]?.file === `cutouts/${item.id}.png`) {
      console.log(`= ${item.id} : déjà détouré`);
      continue;
    }
    todo.push({ item, input, output });
  }
  if (todo.length === 0) {
    console.log('Rien à détourer.');
    return;
  }
  const remove = await pickRemover();
  await mkdir(path.join(DIR, 'cutouts'), { recursive: true });
  let failed = 0;
  for (const { item, input, output } of todo) {
    try {
      await remove(input, output);
      if (credits.images[item.id]) credits.images[item.id].file = `cutouts/${item.id}.png`;
      console.log(`+ ${item.id} : cutouts/${item.id}.png`);
    } catch (err) {
      failed += 1;
      console.warn(`! ${item.id} : ${(err as Error).message}`);
    }
  }
  await writeFile(CREDITS, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`${todo.length - failed} détourée(s), ${failed} en échec.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
