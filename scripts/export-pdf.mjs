/**
 * Export PDF une page 16:9 avec Playwright (serveur Next lancé).
 *   node scripts/export-pdf.mjs [url] [sortie.pdf]
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const url = new URL(process.argv[2] ?? "http://localhost:3000/board-llc");
if (!url.searchParams.has("ui")) url.searchParams.set("ui", "0");
const out = process.argv[3] ?? path.join("captures", "board-llc-16x9.pdf");
fs.mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await page.goto(url.toString(), { waitUntil: "networkidle" });
await page.waitForSelector('[data-frame][data-frame-ready="true"]', { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });
await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, pageRanges: "1", preferCSSPageSize: true });
console.log(out);
await browser.close();
