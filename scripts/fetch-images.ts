/**
 * Télécharge une image Pexels par élément `photo` ou `cutout` du tableau.
 *
 *   PEXELS_API_KEY=... pnpm fetch-images [--force] [--vertical]
 *
 * Tableau 16:9 (par défaut) : public/board/raw/<id>.jpg (taille large) + credits.json.
 * Board vertical (--vertical) : public/board/photos/<id>.jpg + credits.json.
 * Sans clé, le script s'arrête sans erreur : le tableau affiche un bloc couleur
 * avec une icône. Aucun appel réseau au runtime.
 */
import fs from "node:fs";
import path from "node:path";
import { board } from "../data/board169";
import { board as vertical } from "../data/vertical";

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  src: Record<string, string>;
}

const ROOT = path.resolve(__dirname, "..");

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
  const isVertical = args.includes("--vertical");
  const key = process.env.PEXELS_API_KEY;

  const outDir = path.join(ROOT, "public", "board", isVertical ? "photos" : "raw");
  const creditsFile = path.join(outDir, "credits.json");
  fs.mkdirSync(outDir, { recursive: true });
  const credits: Record<string, { photographer: string; url: string }> = fs.existsSync(creditsFile)
    ? JSON.parse(fs.readFileSync(creditsFile, "utf8"))
    : {};

  const targets: { id: string; imageQuery: string; orientation: string }[] = isVertical
    ? vertical.sections.flatMap((s) => s.elements).flatMap((el) => (el.type === "photo" ? [{ id: el.id, imageQuery: el.imageQuery, orientation: "landscape" }] : []))
    : board.elements.flatMap((el) =>
        el.type === "photo" || el.type === "cutout" ? [{ id: el.id, imageQuery: el.imageQuery, orientation: el.type === "photo" ? "landscape" : "square" }] : [],
      );

  if (!key) {
    console.log(`PEXELS_API_KEY absente : ${targets.length} image(s) non téléchargée(s), le tableau utilisera les blocs couleur.`);
    return;
  }

  const used = new Set<number>();
  for (const t of targets) {
    const file = path.join(outDir, `${t.id}.jpg`);
    if (!force && fs.existsSync(file) && credits[t.id]) {
      console.log(`= ${t.id} déjà présent`);
      continue;
    }
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", t.imageQuery);
    url.searchParams.set("per_page", "6");
    url.searchParams.set("orientation", t.orientation);
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) {
      console.error(`! ${t.id} : Pexels a répondu ${res.status}`);
      continue;
    }
    const data = (await res.json()) as { photos: PexelsPhoto[] };
    const photo = data.photos.find((p) => !used.has(p.id)) ?? data.photos[0];
    if (!photo) {
      console.error(`! ${t.id} : aucun résultat pour « ${t.imageQuery} »`);
      continue;
    }
    used.add(photo.id);
    const img = await fetch(photo.src.large2x ?? photo.src.large);
    if (!img.ok) {
      console.error(`! ${t.id} : téléchargement impossible (${img.status})`);
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    credits[t.id] = { photographer: photo.photographer, url: photo.url };
    console.log(`+ ${t.id} <- ${photo.photographer} (${photo.url})`);
  }

  fs.writeFileSync(creditsFile, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`credits.json : ${Object.keys(credits).length} entrée(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
