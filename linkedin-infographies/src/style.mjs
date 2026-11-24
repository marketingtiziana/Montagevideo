// Socle graphique conforme à la charte FYNOVATES (charte/polices.mjs) :
// logo officiel en haut à gauche, rubrique Montserrat capitales (0,3 em) à droite,
// titres Inter SemiBold, textes Inter Regular, navy #0D082E, gris #6B6980, papier #F5F5F7.
import { fix, logo, page } from '../../linkedin-branding/src/core.mjs';
export { fix, logo };

export const K = { navy: '#0D082E', ink: '#2E2C45', mute: '#6B6980', line: 'rgba(13,8,46,.14)', line2: 'rgba(13,8,46,.28)', paper: '#F5F5F7', tint: '#ECEBF2', white: '#FFFFFF' };

const css = `
.cap{font:600 15px/1.2 Mont;letter-spacing:.3em;text-transform:uppercase}
.lab{font:600 14px/1.25 Mont;letter-spacing:.22em;text-transform:uppercase}
h1{font:600 50px/1.1 Inter;letter-spacing:-.025em;color:${K.navy}}
.t{font-family:Inter;color:${K.ink}}
.n{font-family:Inter;font-variant-numeric:tabular-nums}
.hd{position:absolute;left:80px;right:80px;top:64px;height:52px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--l)}
.body{position:absolute;left:80px;right:80px;top:148px;bottom:150px;display:flex;flex-direction:column}
.res{position:absolute;left:80px;right:80px;bottom:112px;font:400 16px/1.4 Inter;color:var(--m)}
.ft{position:absolute;left:80px;right:80px;bottom:56px;height:40px;border-top:1px solid var(--l);display:flex;justify-content:space-between;align-items:flex-end;font:400 17px Inter;color:var(--m)}
.box{border:1px solid ${K.line2};background:#fff}
.dark{background:${K.navy};color:#fff}
.tint{background:${K.paper}}
`;

// frame(rubrique, contenu, { dark, folio, reserve })
export const frame = (rub, body, { dark = false, folio = '', reserve = '' } = {}) => page(1080, 1350, dark ? K.navy : K.white, css,
  `<div class="cv" style="--l:${dark ? 'rgba(255,255,255,.22)' : K.line};--m:${dark ? 'rgba(255,255,255,.62)' : K.mute};color:${dark ? '#fff' : K.navy}">
  <div class="hd">${logo(200, dark ? '#fff' : K.navy)}<span class="cap" style="color:var(--m)">${fix(rub)}</span></div>
  <div class="body">${body}</div>
  ${reserve ? `<div class="res">${fix(reserve)}</div>` : ''}
  <div class="ft"><span>Conseil fiscal, comptabilité &amp; structuration internationale</span><span>${folio || 'fynovates.com'}</span></div></div>`);

export const title = (t, size = 50, extra = '') => `<h1 style="font-size:${size}px;${extra}">${fix(t)}</h1>`;
export const RES = 'Information générale, à adapter à chaque situation. Contenu à valider par un expert avant toute décision.';
