// Rendu déterministe des mockups HTML -> séquence PNG (alpha) -> .mov alpha (qtrle) + .mp4 fond noir (pour blend "screen").
// Usage : node render_mockups.js <in.html> <outdir/name> <seconds> [fps=60]
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'); const path = require('path');
(async () => {
  const [html, out, secs, fpsArg] = process.argv.slice(2);
  const fps = parseInt(fpsArg || '60', 10); const n = Math.round(parseFloat(secs) * fps);
  const dir = out + '_png'; fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(html)); await page.waitForTimeout(300);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.__setTime(t), i / fps);
    await page.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.png`, omitBackground: true });
  }
  await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', `${dir}/f%04d.png`, '-c:v', 'qtrle', '-pix_fmt', 'argb', out + '.mov']);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', `${dir}/f%04d.png`, '-vf', 'format=rgba,split[a][b];[a]drawbox=c=black:t=fill[bg];[bg][b]overlay=format=auto,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-movflags', '+faststart', out + '_black.mp4']);
  console.log('done', out, n, 'frames');
})();
