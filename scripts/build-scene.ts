/**
 * Génère public/board/scene.excalidraw à partir de data/board.ts.
 *
 *   pnpm build-scene            (serveur Next lancé sur http://localhost:3000, ou BOARD_URL)
 *
 * 1. Inventorie les images disponibles (cutouts PNG, photos JPG) -> public/board/assets.json.
 * 2. Ouvre /board-llc/build dans Chromium (Playwright) : le skeleton est converti en éléments
 *    Excalidraw avec les vraies polices (convertToExcalidrawElements).
 * 3. Embarque chaque image en dataURL dans `files` et écrit la scène (elements + files + appState).
 * Sans image, l'élément est un rectangle hachuré avec son nom : rien ne casse.
 */
import fs from "node:fs";
import path from "node:path";
import { board } from "../data/board";
import type { SceneAssets } from "../data/types";

const ROOT = path.resolve(__dirname, "..");
const PUB = path.join(ROOT, "public", "board");
const BASE = process.env.BOARD_URL ?? "http://localhost:3000";

function pngSize(file: string) {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function jpgSize(file: string) {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(file).metadata();
  return { width: meta.width ?? 1, height: meta.height ?? 1 };
}

async function inventory(): Promise<SceneAssets> {
  const images: SceneAssets["images"] = {};
  for (const spec of board.images) {
    const png = path.join(PUB, "cutouts", `${spec.id}.png`);
    const jpg = path.join(PUB, "raw", `${spec.id}.jpg`);
    if (spec.cutout && fs.existsSync(png)) {
      images[spec.id] = { file: `cutouts/${spec.id}.png`, mimeType: "image/png", ...pngSize(png) };
    } else if (fs.existsSync(jpg)) {
      images[spec.id] = { file: `raw/${spec.id}.jpg`, mimeType: "image/jpeg", ...(await jpgSize(jpg)) };
    }
  }
  return { images };
}

async function main() {
  const assets = await inventory();
  fs.writeFileSync(path.join(PUB, "assets.json"), `${JSON.stringify(assets, null, 2)}\n`);
  console.log(`assets.json : ${Object.keys(assets.images).length} image(s) disponible(s) sur ${board.images.length}`);

  const { chromium } = (await import("playwright")) as typeof import("playwright");
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  let elements: { type: string; fileId?: string }[];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("page :", e.message));
    await page.goto(`${BASE}/board-llc/build`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean((window as unknown as { __scene?: unknown }).__scene), null, { timeout: 60000 });
    elements = await page.evaluate(() => (window as unknown as { __scene: { elements: never[] } }).__scene.elements);
  } finally {
    await browser.close();
  }

  const files: Record<string, unknown> = {};
  for (const el of elements) {
    if (el.type !== "image" || !el.fileId || files[el.fileId]) continue;
    const asset = assets.images[el.fileId];
    if (!asset) continue;
    const buf = fs.readFileSync(path.join(PUB, asset.file));
    files[el.fileId] = {
      id: el.fileId,
      mimeType: asset.mimeType,
      dataURL: `data:${asset.mimeType};base64,${buf.toString("base64")}`,
      created: Date.now(),
      lastRetrieved: Date.now(),
    };
  }

  const scene = {
    type: "excalidraw",
    version: 2,
    source: "fynovates-board-llc",
    elements,
    appState: { viewBackgroundColor: "#F7F8FB", gridSize: null },
    files,
  };
  const out = path.join(PUB, "scene.excalidraw");
  fs.writeFileSync(out, JSON.stringify(scene));
  console.log(`${path.relative(ROOT, out)} : ${elements.length} éléments, ${Object.keys(files).length} image(s), ${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} Mo`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
