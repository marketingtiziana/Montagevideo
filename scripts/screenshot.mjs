/**
 * Capture full-page 2x de contrôle avec Playwright.
 * Usage : node scripts/screenshot.mjs [url] [sortie.png]
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

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const sectionMode = /[?&]section=\d/.test(url);
const target = new URL(url);
if (!target.searchParams.has("ui")) target.searchParams.set("ui", "0");
await page.goto(target.toString(), { waitUntil: "networkidle" });
await page.waitForSelector('[data-board][data-board-ready="true"]', { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
if (sectionMode) {
  // Cadre 1080x1350 pour un carrousel : capture du cadre seul.
  await page.waitForSelector('[data-frame][data-frame-ready="true"]');
  await page.locator("[data-frame]").screenshot({ path: out });
  console.log(`${out} (section, 1080x1350 en 2x)`);
} else {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`${out} (hauteur de page : ${height}px)`);
}
await browser.close();
