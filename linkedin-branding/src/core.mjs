// Socle commun : polices, typographie française, logo vectoriel FYNOVATES (tracé du logo officiel), gabarits.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FONTS = path.resolve(ROOT, '../banners/fonts');
export const PHOTOS = path.resolve(ROOT, '../instagram/assets/photos');
const WM = fs.readFileSync(path.join(ROOT, 'brand/wordmark.path'), 'utf8');
const LETTERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'brand/letters.json'), 'utf8')); // 9 lettres [x0,x1]
export const WM_W = 3330, WM_H = 228;

export const fontCSS = (embed = null) => {
  const f = (fam, file, extra = '') => `@font-face{font-family:'${fam}';src:url('${embed ? embed(file) : 'file://' + FONTS + '/' + file}');${extra}}`;
  return [f('Inter', 'Inter.ttf', 'font-weight:100 900;'), f('Mont', 'Montserrat.ttf', 'font-weight:100 900;'),
    f('SrcSerif', 'SourceSerif.ttf', 'font-weight:200 900;'), f('SrcSerif', 'SourceSerifItalic.ttf', 'font-weight:200 900;font-style:italic;'),
    f('Playfair', 'Playfair.ttf', 'font-weight:400 900;'), f('Playfair', 'PlayfairItalic.ttf', 'font-weight:400 900;font-style:italic;'),
    f('Mono', 'PlexMono.ttf', 'font-weight:400;'), f('Mono', 'PlexMonoMedium.ttf', 'font-weight:500 700;')].join('\n');
};

// Typographie française : espaces insécables avant : ; ! ? », après «, milliers.
export const fix = (s = '') => String(s)
  .replace(/ ([:;!?»€%])/g, ' $1').replace(/« /g, '« ')
  .replace(/(\d) (\d{3})/g, '$1 $2').replace(/(\d) (€|%)/g, '$1 $2')
  .replace(/ – /g, ' – ').replace(/n° /g, 'n° ');

// Logo horizontal (ligne unique, proportions officielles).
export const logo = (w, color = '#0D082E') =>
  `<svg viewBox="0 0 ${WM_W} ${WM_H}" width="${w}" height="${(w * WM_H / WM_W).toFixed(2)}" style="display:block" role="img" aria-label="FYNOVATES"><path fill="${color}" fill-rule="evenodd" d="${WM}"/></svg>`;

// Logo composé sur plusieurs lignes à partir des lettres officielles (aucune lettre redessinée).
// rows : ex. [[0,1,2,3],[4,5,6,7,8]] ; mode 'grid' = cellules égales (lettres centrées), 'flow' = approche d'origine.
export const logoStack = (w, color, rows, { mode = 'flow', gap = 90, cell = 280 } = {}) => {
  const lines = rows.map(r => {
    if (mode === 'grid') return { w: r.length * cell, items: r.map((i, k) => ({ i, x: k * cell + (cell - (LETTERS[i][1] - LETTERS[i][0])) / 2 })) };
    const x0 = LETTERS[r[0]][0]; return { w: LETTERS[r[r.length - 1]][1] - x0, items: r.map(i => ({ i, x: LETTERS[i][0] - x0 })) };
  });
  const W = Math.max(...lines.map(l => l.w)), H = rows.length * WM_H + (rows.length - 1) * gap;
  let out = '';
  lines.forEach((l, li) => { const ox = (W - l.w) / 2, oy = li * (WM_H + gap);
    l.items.forEach(({ i, x }) => { const [a, b] = LETTERS[i]; const lw = b - a + 4;
      out += `<svg x="${(ox + x - 2).toFixed(1)}" y="${oy}" width="${lw}" height="${WM_H}" viewBox="${a - 2} 0 ${lw} ${WM_H}"><path fill="${color}" fill-rule="evenodd" d="${WM}"/></svg>`; }); });
  return `<svg viewBox="0 0 ${W} ${H}" width="${w}" height="${(w * H / W).toFixed(2)}" style="display:block" role="img" aria-label="FYNOVATES">${out}</svg>`;
};

export const photo = name => 'file://' + path.join(PHOTOS, name);

export const page = (w, h, bg, css, body) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
${fontCSS()}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};-webkit-font-smoothing:antialiased;font-feature-settings:"kern","liga";text-rendering:geometricPrecision}
.cv{position:relative;width:${w}px;height:${h}px;overflow:hidden}
${css}
</style></head><body><div class="cv">${body}</div></body></html>`;

export const P = [1080, 1350];
