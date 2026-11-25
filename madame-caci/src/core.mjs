// Socle Madame Caci : identité personnelle « Modern Executive », distincte de FYNOVATES.
// Typographies : Cormorant Garamond (titres, citations) + Jost (textes, libellés). Palette tirée des photos :
// crème du chemisier satiné, expresso, cognac du cuir, denim. Aucun logo, aucun monogramme.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'photos/photos.json'), 'utf8'));

export const C = { cream: '#F3EDE4', paper: '#FAF7F2', espresso: '#211B17', cognac: '#8E5B3B', denim: '#1F2A44', stone: '#8C847B', ink: '#2B2420' };

export const fontCSS = `
@font-face{font-family:'Cormorant';src:url('file://${ROOT}/fonts/CormorantGaramond.woff2') format('woff2');font-weight:300 700;font-style:normal}
@font-face{font-family:'Cormorant';src:url('file://${ROOT}/fonts/CormorantGaramond-Italic.woff2') format('woff2');font-weight:300 700;font-style:italic}
@font-face{font-family:'Jost';src:url('file://${ROOT}/fonts/Jost.woff2') format('woff2');font-weight:100 900}`;

// Typographie française : espaces insécables.
export const fix = (s = '') => String(s).replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ').replace(/(\d) (\d{3})/g, '$1 $2').replace(/ – /g, ' – ');

export const photoURL = k => `file://${ROOT}/photos/traitees/${k}.jpg`;

// Recadrage : point focal (fx, fy en fraction de l'image) et zoom ≥ 1 par rapport au cadrage « cover ».
export const crop = (k, W, H, fx = .5, fy = .5, z = 1) => {
  const [iw, ih] = META[k]; const s = Math.max(W / iw, H / ih) * z, w = iw * s, h = ih * s;
  const x = Math.min(0, Math.max(W - w, W / 2 - fx * w)), y = Math.min(0, Math.max(H - h, H / 2 - fy * h));
  return `background:url('${photoURL(k)}') ${x.toFixed(1)}px ${y.toFixed(1)}px/${w.toFixed(1)}px ${h.toFixed(1)}px no-repeat`;
};
export const photo = (k, W, H, fx, fy, z, extra = '') => `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;${crop(k, W, H, fx, fy, z)};${extra}"></div>`;

const baseCSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.cv{position:relative;overflow:hidden}
.d{font-family:Cormorant;font-weight:500;letter-spacing:-.005em}
.di{font-family:Cormorant;font-style:italic;font-weight:500}
.j{font-family:Jost;font-weight:400}
.lab{font-family:Jost;font-weight:500;letter-spacing:.24em;text-transform:uppercase}
.abs{position:absolute}`;

export const page = (W, H, body, css = '', bg = C.espresso) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCSS}${baseCSS}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${bg}}.cv{width:${W}px;height:${H}px}${css}</style></head><body><div class="cv">${body}</div></body></html>`;

// Voiles de lisibilité (dégradés doux, pas d'effet décoratif).
export const veil = (dir = 'top', a = .7, stop = 55) => `<div class="abs" style="inset:0;background:linear-gradient(to ${dir},rgba(22,17,14,${a}) 0%,rgba(22,17,14,${a * .55}) ${stop * .5}%,rgba(22,17,14,0) ${stop}%)"></div>`;
export const sign = (color = C.cream, size = 34) => `<span class="di" style="font-size:${size}px;color:${color}">— Tiziana</span>`;
