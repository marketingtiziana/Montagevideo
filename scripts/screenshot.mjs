/**
 * Capture de contrôle avec Playwright.
 *   node scripts/screenshot.mjs [url] [sortie.png]
 * Board deux colonnes (/board-llc) : capture de la fenêtre 1920x1080 en 2x (vue initiale, échelle 1).
 * Canvas Excalidraw (/board-llc-excalidraw) : capture de la fenêtre 1920x1080 en 2x.
 * Tableau 16:9 (/board-llc-16x9) : capture du cadre 1920x1080 en 2x.
 * Board vertical (/board-llc-vertical) : capture full-page 2x.
 * Le serveur Next doit tourner (pnpm dev ou pnpm start).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const url = process.argv[2] ?? "http://localhost:3000/board-llc";
const out = process.argv[3] ?? path.join("captures", `board-${Date.now()}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });

const launch = {};
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;

const target = new URL(url);
if (!target.searchParams.has("ui")) target.searchParams.set("ui", "0");
const vertical = target.pathname.includes("vertical");
const sixteen = target.pathname.includes("16x9");
const excalidraw = target.pathname.includes("excalidraw");

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: vertical ? { width: 1080, height: 1350 } : { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await page.goto(target.toString(), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
if (vertical) {
  await page.waitForSelector('[data-board][data-board-ready="true"]', { timeout: 30000 });
  await page.waitForTimeout(500);
  if (/[?&]section=\d/.test(url)) {
    await page.waitForSelector('[data-frame][data-frame-ready="true"]');
    await page.locator("[data-frame]").screenshot({ path: out });
    console.log(`${out} (section, 1080x1350 en 2x)`);
  } else {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`${out} (hauteur de page : ${height}px)`);
  }
} else if (sixteen) {
  await page.waitForSelector('[data-frame][data-frame-ready="true"]', { timeout: 30000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out });
  console.log(`${out} (cadre 16:9, 3840x2160)`);
} else if (excalidraw) {
  await page.waitForSelector('[data-scene-ready="true"]', { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out });
  console.log(`${out} (canvas Excalidraw, 3840x2160)`);
} else {
  await page.waitForSelector('[data-board-ready="true"]', { timeout: 60000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: out });
  console.log(`${out} (board, fenêtre 1920x1080 en 2x)`);
}
await browser.close();
