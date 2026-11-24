// FYNOVATES — planche typographique.  usage: node charte/polices.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const ff = (f) => 'file://' + path.join(ROOT, '..', 'banners', 'fonts', f);
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, '..', 'banners-v8', 'brand', 'wordmark-3x.png')).toString('base64');
const story = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, '..', 'stories', 'output', 'sequence-A-1-educ-question.png')).toString('base64');
const NAVY = '#0D082E', MUTE = '#6B6980', LINE = 'rgba(13,8,46,.14)';
const word = (w, c) => `<div style="width:${w}px;height:${(w * 76 / 1110).toFixed(1)}px;background:${c};-webkit-mask:url(${WORD}) 0 0/100% 100%"></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:SrcSerif;src:url(${ff('SourceSerif.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}body{width:1600px;background:#F5F5F7;font-family:Inter;color:${NAVY};-webkit-font-smoothing:antialiased;padding:90px}
.cap{font:600 18px Mont;letter-spacing:.3em;text-transform:uppercase;color:${MUTE}}
.card{background:#fff;border-radius:20px;padding:44px 48px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}
h2{font:600 40px Inter;letter-spacing:-.02em;margin:10px 0 6px}
.role{font:400 20px/1.5 Inter;color:#3B3953;margin-bottom:26px}
.spec{display:grid;grid-template-columns:200px 1fr;align-items:baseline;gap:20px;padding:18px 0;border-top:1px solid ${LINE}}
.spec .k{font:500 16px Inter;color:${MUTE}}
.az{font-size:30px;letter-spacing:.02em;color:#2E2C45;margin-top:22px;line-height:1.5}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:56px">
  <div><div class="cap">Charte graphique · Typographie</div><div style="font:600 64px/1.05 Inter;letter-spacing:-.03em;margin-top:14px">Les polices FYNOVATES</div>
  <div style="font:400 22px/1.5 Inter;color:#3B3953;margin-top:14px;max-width:900px">Deux polices pour tous les supports : Inter pour lire, Montserrat pour classer. Le nom FYNOVATES n’est jamais tapé dans une police : c’est toujours l’image du logo d’origine.</div></div>
  ${word(300, NAVY)}
</div>

<div class="card" style="margin-bottom:28px;display:grid;grid-template-columns:1fr 420px;gap:48px;align-items:center">
  <div>
    <div class="cap">0 · La signature</div><h2>Le logo FYNOVATES</h2>
    <div class="role">Une image, pas une police. Toujours le fichier d’origine, en navy ou en blanc, jamais retapé, déformé ni accompagné d’une icône.</div>
    <div style="display:flex;gap:24px">
      <div style="background:#fff;border:1px solid ${LINE};border-radius:14px;padding:40px 44px">${word(330, NAVY)}</div>
      <div style="background:${NAVY};border-radius:14px;padding:40px 44px">${word(330, '#fff')}</div></div>
  </div>
  <div class="cap" style="line-height:2">Fichier<br><span style="font:500 18px Inter;letter-spacing:0;text-transform:none;color:${NAVY}">brand/wordmark-3x.png</span></div>
</div>

<div class="grid" style="margin-bottom:28px">
  <div class="card">
    <div class="cap">1 · Police principale</div><h2>Inter</h2>
    <div class="role">Tout ce qui se lit : titres, textes, légendes, boutons. Très lisible sur téléphone, même en petit.</div>
    <div class="spec"><div class="k">Titre · SemiBold 600</div><div style="font:600 52px/1.05 Inter;letter-spacing:-.028em">Ta société est à l’étranger. Et la TVA ?</div></div>
    <div class="spec"><div class="k">Sous-titre · SemiBold 600</div><div style="font:600 32px/1.15 Inter;letter-spacing:-.02em">Trois questions décident de ta TVA</div></div>
    <div class="spec"><div class="k">Texte · Regular 400</div><div style="font:400 22px/1.5 Inter">Une société créée hors de France ne fait pas disparaître la TVA. Tout dépend de tes clients et de ce que tu vends.</div></div>
    <div class="spec"><div class="k">Légende · Medium 500</div><div style="font:500 18px Inter;color:${MUTE}">La réponse dans la story suivante →</div></div>
    <div class="az">Aa Bb Cc Éé Àà Çç 0123456789 € % ?</div>
  </div>
  <div class="card">
    <div class="cap">2 · Police secondaire</div><h2>Montserrat</h2>
    <div class="role">Uniquement en petites capitales espacées, pour classer : rubriques, étiquettes, stories à la une. Jamais pour un texte à lire.</div>
    <div class="spec"><div class="k">Rubrique · SemiBold 600</div><div style="font:600 22px Mont;letter-spacing:.3em">FISCALITÉ · TVA</div></div>
    <div class="spec"><div class="k">Étiquette · SemiBold 600</div><div style="font:600 22px Mont;letter-spacing:.3em">QUESTION FISCALE</div></div>
    <div class="spec"><div class="k">Badge · Bold 700</div><div><span style="background:${NAVY};color:#fff;font:700 18px Mont;letter-spacing:.24em;padding:10px 16px;border-radius:6px">ALERTE</span></div></div>
    <div class="spec"><div class="k">Story à la une · Bold 700</div><div style="width:150px;height:150px;border-radius:50%;background:${NAVY};display:flex;align-items:center;justify-content:center;font:700 19px Mont;letter-spacing:.14em;color:#fff">BANQUE</div></div>
    <div class="spec"><div class="k">Règle</div><div style="font:400 20px/1.5 Inter">Toujours en majuscules, espacement des lettres de 0,3 em.</div></div>
  </div>
</div>

<div class="grid">
  <div class="card" style="display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:center">
    <div style="position:relative">
      <img src="${story}" style="width:300px;border-radius:16px;display:block">
    </div>
    <div>
      <div class="cap">En situation</div><h2>La hiérarchie</h2>
      <div style="display:grid;gap:16px;margin-top:20px;font:400 20px/1.45 Inter">
        <div><b style="font-weight:600">1. Le logo</b>, en haut à gauche, et la rubrique en Montserrat à droite.</div>
        <div><b style="font-weight:600">2. L’étiquette</b> en Montserrat, au-dessus du titre.</div>
        <div><b style="font-weight:600">3. Le titre</b> en Inter SemiBold, très grand.</div>
        <div><b style="font-weight:600">4. Le texte</b> en Inter Regular, court.</div>
        <div><b style="font-weight:600">5. La légende</b> en Inter Medium, en bas, plus discrète.</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="cap">Hors réseaux sociaux</div><h2>Source Serif 4</h2>
    <div class="role">Police d’appoint, utilisée seulement sur certaines bannières YouTube pour une signature au ton plus éditorial. Elle n’est pas utilisée dans les Stories ni dans le feed.</div>
    <div class="spec"><div class="k">Signature · Regular</div><div style="font:400 30px SrcSerif">Conseil fiscal &amp; structuration internationale.</div></div>
    <div style="margin-top:34px" class="cap">Où les trouver</div>
    <div style="font:400 20px/1.6 Inter;margin-top:10px">Les trois polices sont gratuites sur Google Fonts, sous licence libre OFL, utilisable commercialement. Elles sont déjà installées dans le projet, dans <b style="font-weight:500">banners/fonts/</b>.</div>
  </div>
</div>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'polices.html'), html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.join(ROOT, 'polices.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
await p.screenshot({ path: path.join(ROOT, 'fynovates-polices.png'), fullPage: true }); await b.close(); console.log('ok');
