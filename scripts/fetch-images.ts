/**
 * Télécharge une photo Pexels par élément `photo` du board.
 *
 *   PEXELS_API_KEY=... pnpm fetch-images [--force] [--size medium|large|large2x]
 *
 * Les fichiers vont dans public/board/photos/<id>.jpg et credits.json garde
 * le nom du photographe et l'URL. Sans clé, le script s'arrête sans erreur :
 * le board affiche alors un bloc couleur avec une icône. Aucun appel au runtime.
 *
 * Taille par défaut : `large` (environ 940 px de large) pour que l'export PNG en 2x
 * reste net. Passer `--size medium` pour la taille medium de l'API.
 */
import fs from "node:fs";
import path from "node:path";
import { board } from "../data/board";

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: Record<string, string>;
}

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "board", "photos");
const CREDITS = path.join(OUT_DIR, "credits.json");

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadDotEnv();
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const sizeIdx = args.indexOf("--size");
  const size = sizeIdx >= 0 ? args[sizeIdx + 1] : process.env.PEXELS_SIZE ?? "large";
  const key = process.env.PEXELS_API_KEY;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const credits: Record<string, { photographer: string; url: string }> = fs.existsSync(CREDITS)
    ? JSON.parse(fs.readFileSync(CREDITS, "utf8"))
    : {};

  const photos = board.sections.flatMap((s) => s.elements).filter((el) => el.type === "photo");
  if (!key) {
    console.log(`PEXELS_API_KEY absente : ${photos.length} photo(s) non téléchargée(s), le board utilisera les blocs couleur.`);
    return;
  }

  const used = new Set<number>();
  for (const el of photos) {
    if (el.type !== "photo") continue;
    const file = path.join(OUT_DIR, `${el.id}.jpg`);
    if (!force && fs.existsSync(file) && credits[el.id]) {
      console.log(`= ${el.id} déjà présent`);
      continue;
    }
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", el.imageQuery);
    url.searchParams.set("per_page", "6");
    url.searchParams.set("orientation", "landscape");
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) {
      console.error(`! ${el.id} : Pexels a répondu ${res.status}`);
      continue;
    }
    const data = (await res.json()) as { photos: PexelsPhoto[] };
    const photo = data.photos.find((p) => !used.has(p.id)) ?? data.photos[0];
    if (!photo) {
      console.error(`! ${el.id} : aucun résultat pour « ${el.imageQuery} »`);
      continue;
    }
    used.add(photo.id);
    const src = photo.src[size] ?? photo.src.large;
    const img = await fetch(src);
    if (!img.ok) {
      console.error(`! ${el.id} : téléchargement impossible (${img.status})`);
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    credits[el.id] = { photographer: photo.photographer, url: photo.url };
    console.log(`+ ${el.id} <- ${photo.photographer} (${photo.url})`);
  }

  fs.writeFileSync(CREDITS, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`credits.json : ${Object.keys(credits).length} entrée(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
