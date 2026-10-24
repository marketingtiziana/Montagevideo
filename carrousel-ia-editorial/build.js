// Carrousel « Les dangers de demander des conseils fiscaux à une IA » — version éditoriale minimaliste.
// Fynovates / Madame Caci. HTML/CSS rendu par Playwright en PNG 1080x1350. Texte 100 % vectoriel.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output');
const HTML_DIR = path.join(__dirname, 'html');
const FONTS = path.join(__dirname, 'fonts');
const IMG = path.join(__dirname, 'img');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTML_DIR, { recursive: true });

const CSS = `
@font-face{font-family:"Playfair Display";src:url("file://${FONTS}/PlayfairDisplay[wght].ttf");font-weight:400 900;font-style:normal}
@font-face{font-family:"Playfair Display";src:url("file://${FONTS}/PlayfairDisplay-Italic[wght].ttf");font-weight:400 900;font-style:italic}
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-Regular.ttf");font-weight:400}
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-Medium.ttf");font-weight:500}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden;background:#FFFFFF}
body{font-family:"Inter",sans-serif;color:#0A0A0A;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;background:#FFFFFF}

/* navigation & signature : seul usage du gris */
.nav{position:absolute;font-weight:400;font-size:24px;letter-spacing:.2em;color:#9A9A9A;white-space:nowrap}
.sig{position:absolute;font-weight:400;font-size:20px;letter-spacing:.3em;color:#9A9A9A;white-space:nowrap}

/* images : noir et blanc, bords francs */
.photo{position:absolute;overflow:hidden;background:#0A0A0A}
.photo img{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1) contrast(1.08)}

/* typographie */
.title{font-family:"Playfair Display",serif;font-weight:800;line-height:1.05;letter-spacing:-0.005em}
.body{font-weight:300;font-size:32px;line-height:1.6}
.mono{font-family:"IBM Plex Mono",monospace;font-weight:400;font-size:28px;line-height:1.5}
.quote{font-family:"Playfair Display",serif;font-style:italic;font-weight:500;line-height:1.25}
.strike{text-decoration:line-through;text-decoration-thickness:1.5px;text-decoration-color:#0A0A0A}
.u{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:10px}
.rule{width:64px;height:1px;background:#0A0A0A}
`;

const nav = (n, style = '') => `<div class="nav" style="${style}">${String(n).padStart(2, '0')} / 09</div>`;
const sig = (style = '', size) => `<div class="sig" style="${style}${size ? `;font-size:${size}px` : ''}">MADAME CACI</div>`;
const photo = (n, style) => `<div class="photo" style="${style}"><img src="file://${IMG}/slide-0${n}.jpg"></div>`;

const slides = [];

/* 1 — COUVERTURE : bandeau haut 45 % */
slides.push(`<div class="slide">
${photo(1, 'left:0;top:0;width:1080px;height:607px')}
${nav(1, 'left:100px;top:671px')}
<div class="title" style="position:absolute;left:100px;top:740px;width:880px;font-size:76px">Les dangers de demander des conseils fiscaux à une <span class="u">IA</span>.</div>
<div class="body" style="position:absolute;left:100px;top:1070px;width:700px;font-size:30px">Ce que tu dois savoir avant de suivre sa prochaine réponse.</div>
${sig('left:100px;bottom:100px')}
<div class="body" style="position:absolute;right:100px;bottom:100px;font-size:26px;font-weight:300;letter-spacing:.02em">glisser →</div>
</div>`);

/* 2 — typographique */
slides.push(`<div class="slide">
${nav(2, 'left:100px;top:100px')}
<div class="mono" style="position:absolute;left:100px;top:300px;width:880px">
<div>« Comment payer moins d'impôts ? »</div>
<div style="margin-top:28px">« Quelle structure pour mon business ? »</div>
</div>
<div class="rule" style="position:absolute;left:100px;top:500px"></div>
<div class="body" style="position:absolute;left:100px;top:560px;width:800px">Des milliers d'entrepreneurs posent ces questions à une IA chaque jour. Et certains exécutent la réponse. Sans vérification. Sans dossier. Sans filet.</div>
<div class="quote" style="position:absolute;left:100px;top:940px;width:800px;font-size:46px">Les dégâts arrivent avec 2 ou 3 ans de retard.</div>
${sig('left:100px;bottom:100px')}
</div>`);

/* 3 — DANGER 1 : bloc vertical droit 40 % */
slides.push(`<div class="slide">
${photo(3, 'right:0;top:0;width:432px;height:1350px')}
${nav(3, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:300px;width:480px;font-size:58px">Danger n°1 — Les règles périmées.</div>
<div class="body" style="position:absolute;left:100px;top:600px;width:480px;font-size:30px">Une IA peut te recommander avec un aplomb parfait un régime fiscal fermé depuis des années.</div>
<div style="position:absolute;left:100px;top:862px;width:480px">
<div class="mono strike" style="font-size:26px">Le régime RNH du Portugal vous permet de...</div>
<div class="body" style="margin-top:14px;font-size:28px;font-weight:400">Fermé depuis 2023.</div>
</div>
<div class="quote" style="position:absolute;left:100px;top:1090px;width:480px;font-size:34px">Tu le découvres une fois installé. Trop tard.</div>
${sig('left:100px;bottom:100px')}
</div>`);

/* 4 — DANGER 2 */
slides.push(`<div class="slide">
${nav(4, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:300px;width:880px;font-size:64px">Danger n°2 — La réponse moyenne.</div>
<div class="body" style="position:absolute;left:100px;top:540px;width:800px">Elle ne connaît ni ta famille, ni tes clients, ni ton historique, ni tes contrats. Elle te donne la réponse moyenne d'Internet.</div>
<div class="quote" style="position:absolute;left:100px;top:860px;width:860px;font-size:50px">En fiscalité, la moyenne appliquée au mauvais profil est une bombe à retardement.</div>
${sig('left:100px;bottom:100px')}
</div>`);

/* 5 — DANGER 3 : bandeau bas 35 % */
slides.push(`<div class="slide">
${nav(5, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:240px;width:880px;font-size:64px">Danger n°3 — L'erreur invisible.</div>
<div class="body" style="position:absolute;left:100px;top:450px;width:800px">Elle mélange le vrai et le faux dans la même réponse fluide. Pour repérer l'erreur, il faudrait déjà être expert.</div>
<div class="quote" style="position:absolute;left:100px;top:690px;width:800px;font-size:40px">Tu avances confiant. Directement vers le mur.</div>
${sig('left:100px;top:812px')}
${photo(5, 'left:0;bottom:0;width:1080px;height:472px')}
</div>`);

/* 6 — DANGER 4 */
slides.push(`<div class="slide">
${nav(6, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:280px;width:880px;font-size:60px">Danger n°4 — Personne ne paiera à ta place.</div>
<div class="body" style="position:absolute;left:100px;top:520px;width:840px;font-size:30px">Un expert engage sa responsabilité professionnelle. Une IA ne signe rien, ne garantit rien, ne répond de rien. Le contrôle tombe ? Redressement, pénalités, intérêts : tout est pour toi.</div>
<div class="mono" style="position:absolute;left:100px;top:860px;width:880px">Je ne peux pas être tenue responsable de...</div>
<div class="quote" style="position:absolute;left:100px;top:980px;width:800px;font-size:44px">Elle, elle s'excusera. Gratuitement.</div>
${sig('left:100px;bottom:100px')}
</div>`);

/* 7 — SCÉNARIO : bloc vertical gauche 40 % */
slides.push(`<div class="slide">
${photo(7, 'left:0;top:0;width:432px;height:1350px')}
${nav(7, 'left:532px;top:100px')}
<div class="title" style="position:absolute;left:532px;top:300px;width:448px;font-size:60px">Le scénario qui se répète.</div>
<div class="body" style="position:absolute;left:532px;top:520px;width:448px;font-size:29px">Il monte sa LLC conseillée par l'IA. Personne ne lui parle du formulaire 5472. Trois ans plus tard : 25 000$ de pénalité par année manquée.</div>
<div class="quote" style="position:absolute;left:532px;top:940px;width:448px;font-size:32px">L'IA n'avait pas menti. Elle avait juste oublié. Et l'oubli d'une machine, c'est toi qui le paies.</div>
${sig('left:532px;bottom:100px')}
</div>`);

/* 8 — PIVOT */
slides.push(`<div class="slide">
${nav(8, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:420px;width:880px;font-size:84px">L'IA pour explorer.<br>L'expert pour <em>décider.</em></div>
<div class="body" style="position:absolute;left:100px;top:700px;width:800px;font-size:30px">Comprendre un concept, préparer tes questions : parfait. Décider une structure, un départ, un montage : jamais seul. Ce sont des décisions à 5 ou 6 chiffres, engageantes sur des années.</div>
${sig('left:100px;bottom:100px')}
</div>`);

/* 9 — CTA */
slides.push(`<div class="slide">
${nav(9, 'left:100px;top:100px')}
<div class="title" style="position:absolute;left:100px;top:500px;width:880px;font-size:104px">Commente EXPERT</div>
<div class="body" style="position:absolute;left:100px;top:800px;width:760px;font-size:30px">Fais vérifier ton projet par une humaine. 8 ans d'expertise, +800 entrepreneurs accompagnés. L'échange est offert.</div>
${sig('left:100px;bottom:100px', 28)}
</div>`);

/* ---------------- RENDU ---------------- */
const only = process.argv.slice(2).map(Number);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let i = 0; i < slides.length; i++) {
    const n = i + 1;
    if (only.length && !only.includes(n)) continue;
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>slide-${n}</title><style>${CSS}</style></head><body>${slides[i]}</body></html>`;
    const file = path.join(HTML_DIR, `slide-${String(n).padStart(2, '0')}.html`);
    fs.writeFileSync(file, html);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('img').forEach(im => { if (!im.complete || im.naturalWidth === 0) bad.push('image manquante ' + im.src.split('/').pop()); });
      document.querySelectorAll('.slide > *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (el.classList.contains('photo')) return;
        if (r.right > 1080 - 99 || r.bottom > 1350 - 99 || r.left < 99 || r.top < 99) {
          // marges 100 px : signalé seulement pour le texte
          if (el.textContent.trim()) bad.push(`marge ${el.className} ${el.textContent.trim().slice(0, 25)} → ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`);
        }
      });
      // chevauchements entre blocs de texte
      const els = [...document.querySelectorAll('.slide > *')].filter(e => e.textContent.trim());
      for (let a = 0; a < els.length; a++) for (let b = a + 1; b < els.length; b++) {
        const A = els[a].getBoundingClientRect(), B = els[b].getBoundingClientRect();
        if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) bad.push(`chevauchement ${els[a].className} / ${els[b].className}`);
      }
      return bad;
    });
    if (report.length) console.warn(`slide ${n}:`, report);
    await page.screenshot({ path: path.join(OUT, `slide-${String(n).padStart(2, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log('ok slide', n);
  }
  await browser.close();
})();
