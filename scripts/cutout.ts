/**
 * Détoure les images des éléments `cutout` : public/board/raw/<id>.jpg
 * -> public/board/cutouts/<id>.png (fond transparent, marges rognées),
 * et écrit manifest.json (dimensions de chaque PNG).
 *
 *   pnpm cutout [--force] [--only <id>]
 *
 * Moteur : @imgly/background-removal-node (modèle téléchargé au premier lancement).
 * Repli : la commande `rembg` si elle est installée. Sans image source, l'élément est
 * simplement ignoré et le tableau garde son bloc de repli.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { board } from "../data/board";

const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "public", "board", "raw");
const OUT = path.join(ROOT, "public", "board", "cutouts");
const MANIFEST = path.join(OUT, "manifest.json");

function pngSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function removeWithImgly(input: string): Promise<Buffer> {
  const { removeBackground } = await import("@imgly/background-removal-node");
  const blob = await removeBackground(input, { output: { format: "image/png", quality: 1 } });
  return Buffer.from(await blob.arrayBuffer());
}

function removeWithRembg(input: string, output: string): boolean {
  try {
    execFileSync("rembg", ["i", input, output], { stdio: "ignore" });
    return fs.existsSync(output);
  } catch {
    return false;
  }
}

async function trim(buf: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(buf).ensureAlpha().trim({ threshold: 8 }).png().toBuffer();
  } catch {
    return buf;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : undefined;

  fs.mkdirSync(OUT, { recursive: true });
  const manifest: Record<string, { width: number; height: number }> = fs.existsSync(MANIFEST)
    ? JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
    : {};

  const cutouts = board.elements.filter((el) => el.type === "cutout" && (!only || el.id === only));
  let done = 0;
  for (const el of cutouts) {
    const input = path.join(RAW, `${el.id}.jpg`);
    const output = path.join(OUT, `${el.id}.png`);
    if (!fs.existsSync(input)) {
      console.log(`- ${el.id} : pas d'image source (lancer fetch-images avec une clé Pexels)`);
      continue;
    }
    if (!force && fs.existsSync(output) && manifest[el.id]) {
      console.log(`= ${el.id} déjà détouré`);
      continue;
    }
    let ok = false;
    try {
      const png = await trim(await removeWithImgly(input));
      fs.writeFileSync(output, png);
      ok = true;
    } catch (err) {
      console.warn(`  ${el.id} : moteur imgly indisponible (${(err as Error).message.split("\n")[0]}), essai avec rembg`);
      ok = removeWithRembg(input, output);
      if (ok) fs.writeFileSync(output, await trim(fs.readFileSync(output)));
    }
    if (!ok) {
      console.error(`! ${el.id} : détourage impossible`);
      continue;
    }
    manifest[el.id] = pngSize(output);
    done += 1;
    console.log(`+ ${el.id} -> ${path.relative(ROOT, output)} (${manifest[el.id].width}x${manifest[el.id].height})`);
  }

  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest.json : ${Object.keys(manifest).length} cutout(s), ${done} traité(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
