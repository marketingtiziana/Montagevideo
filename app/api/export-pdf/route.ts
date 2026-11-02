import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export PDF d'une page 16:9 via Playwright (environnement local ou serveur avec Chromium).
 * Si Playwright ou Chromium manquent (hébergement statique), répond 501 et le bouton
 * bascule sur l'impression navigateur.
 */
export async function GET(request: Request) {
  try {
    const { chromium } = await import("playwright");
    const origin = new URL(request.url).origin;
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
      await page.goto(`${origin}/board-llc-16x9?ui=0`, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-frame][data-frame-ready="true"]', { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: "print" });
      const pdf = await page.pdf({ width: "1920px", height: "1080px", printBackground: true, pageRanges: "1", preferCSSPageSize: true });
      return new NextResponse(pdf, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="board-llc-16x9.pdf"' },
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 501 });
  }
}
