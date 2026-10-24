// Générateur du carrousel "Les dangers de demander des conseils fiscaux à une IA"
// Fynovates / Madame Caci — déclinaison ALERTE. HTML/CSS/SVG -> PNG 1080x1350 via Playwright.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output');
const HTML_DIR = path.join(__dirname, 'html');
const FONTS = path.join(__dirname, 'fonts');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTML_DIR, { recursive: true });

const BLUE = '#4353FF';

const CSS = `
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-Regular.ttf");font-weight:400}
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-Medium.ttf");font-weight:500}
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-SemiBold.ttf");font-weight:600}
@font-face{font-family:"IBM Plex Mono";src:url("file://${FONTS}/IBMPlexMono-Bold.ttf");font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:"Inter",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;padding:0 80px}
.dark{background:#0E1230;color:#FFFFFF}
.light{background:#F7F8FC;color:#12121F}
.mono{font-family:"IBM Plex Mono",monospace}

/* --- bandes de signalisation --- */
.hazard{position:absolute;left:0;right:0;height:12px;
  background:repeating-linear-gradient(45deg,${BLUE} 0 9px,transparent 9px 18px)}
.hazard.top{top:0}.hazard.bottom{bottom:0}

/* --- grille filigrane en coin --- */
.grid{position:absolute;width:520px;height:520px;pointer-events:none;
  background-image:linear-gradient(rgba(67,83,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(67,83,255,.10) 1px,transparent 1px);
  background-size:40px 40px;background-position:0 0}
.grid.br{right:0;bottom:0;-webkit-mask-image:radial-gradient(circle at 100% 100%,#000 0%,transparent 72%)}
.grid.tl{left:0;top:0;-webkit-mask-image:radial-gradient(circle at 0% 0%,#000 0%,transparent 72%)}
.grid.bl{left:0;bottom:0;-webkit-mask-image:radial-gradient(circle at 0% 100%,#000 0%,transparent 72%)}

/* --- numéro géant outline --- */
.num{position:absolute;top:34px;right:64px;font-weight:900;font-size:230px;line-height:1;letter-spacing:-0.04em;
  color:transparent;-webkit-text-stroke:2px rgba(67,83,255,.25)}

/* --- badge pill --- */
.head{position:absolute;top:96px;left:80px;display:flex;align-items:center;gap:16px}
.pill{display:inline-flex;align-items:center;height:52px;padding:0 24px;border-radius:999px;
  font-weight:800;font-size:21px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;color:${BLUE}}
.dark .pill{background:#1A2050}
.light .pill{background:#EFF1F7}
.tri{width:52px;height:52px;flex:0 0 auto}

.content{position:absolute;left:80px;top:300px;width:920px}

/* --- titres --- */
.title{font-weight:900;font-size:92px;line-height:1.02;letter-spacing:-0.02em;white-space:nowrap}
.title .k{color:${BLUE}}
.glitch{position:relative;display:inline-block}
.glitch::before{content:attr(data-text);position:absolute;left:0;top:0;transform:translate(2px,-2px);color:rgba(67,83,255,.4);pointer-events:none}

/* --- corps --- */
.sub{font-weight:600;font-size:36px;line-height:1.3;color:#8A8FA3}
.body{font-weight:600;font-size:36px;line-height:1.32}
.dark .body{color:#FFFFFF}
.light .body{color:#12121F}
.punch{position:relative;font-weight:800;font-size:38px;line-height:1.25;padding-left:28px}
.punch::before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:6px;border-radius:3px;background:${BLUE}}
.dim{color:#8A8FA3}

/* --- cards --- */
.card{background:#1A2050;border-radius:24px;padding:40px 44px}
.light .card{background:#EFF1F7}
.card.blue{background:${BLUE};box-shadow:0 30px 70px rgba(67,83,255,.5);color:#fff}

/* --- bulle IA --- */
.bubble{position:relative;background:#1A2050;border:1px solid rgba(67,83,255,.3);border-radius:24px;border-bottom-left-radius:8px;
  padding:34px 40px;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:31px;line-height:1.42;color:#E6E8F4}
.bubble .dots{display:flex;gap:8px;margin-bottom:22px}
.bubble .dots i{width:10px;height:10px;border-radius:2px;background:${BLUE};opacity:.45}
.bubble .dots i:first-child{opacity:1}
.cursor{display:inline-block;color:${BLUE};font-weight:700;margin-left:2px}

/* --- tampon --- */
.stamp{position:absolute;display:inline-block;padding:14px 26px;border:3px solid ${BLUE};border-radius:10px;
  box-shadow:inset 0 0 0 4px #0E1230,inset 0 0 0 5px rgba(67,83,255,.55);
  background:rgba(14,18,48,.92);color:${BLUE};font-weight:900;font-size:44px;letter-spacing:.08em;text-transform:uppercase;
  line-height:1;white-space:nowrap;transform:rotate(-10deg)}

/* --- bouton swipe --- */
.swipe{position:absolute;right:80px;bottom:72px;width:64px;height:64px;border-radius:50%;background:${BLUE};
  display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(67,83,255,.5)}

/* --- indicateur de progression --- */
.prog{position:absolute;left:80px;bottom:88px;display:flex;gap:8px}
.prog i{width:28px;height:4px;border-radius:2px;background:rgba(67,83,255,.22)}
.prog i.on{background:${BLUE};width:56px}
.light .prog i{background:rgba(67,83,255,.18)}
.light .prog i.on{background:${BLUE}}
`;

const TRI = `<svg class="tri" viewBox="0 0 52 52" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M26 6.5 L47.5 43.5 Q48.5 46 45.6 46 L6.4 46 Q3.5 46 4.5 43.5 Z"/>
<path d="M26 19 L26 31" stroke-width="4"/><circle cx="26" cy="38.5" r="2.4" fill="${BLUE}" stroke="none"/></svg>`;

const ARROW = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M5 15h19M16 7l8 8-8 8"/></svg>`;

const prog = (n) => `<div class="prog">${Array.from({length:9},(_,i)=>`<i class="${i+1===n?'on':''}"></i>`).join('')}</div>`;
const num = (n) => `<div class="num">${String(n).padStart(2,'0')}</div>`;
const head = (label, tri=false) => `<div class="head">${tri?TRI:''}<span class="pill">${label}</span></div>`;
const bubble = (inner, extra='') => `<div class="bubble" ${extra}><div class="dots"><i></i><i></i><i></i></div>${inner}</div>`;

const slides = [];
// Zone de contenu en flux : démarre sous l'en-tête, les blocs s'enchaînent avec des marges explicites.
const content = (inner) => `<div class="content">${inner}</div>`;

/* ---------------- SLIDE 1 — HOOK ---------------- */
slides.push(`<div class="slide dark">
<div class="hazard top"></div><div class="hazard bottom"></div>
<div class="grid br"></div>
${num(1)}
${head('• ALERTE', true)}
${content(`
<div class="title" style="font-size:84px">Les dangers de demander<br>des conseils fiscaux<br>à une <span class="k glitch" data-text="IA.">IA.</span></div>
<div class="sub" style="margin-top:44px;width:820px">Ce que tu dois savoir avant de suivre sa prochaine réponse.</div>
<div style="margin-top:150px">${bubble(`Pour payer 0% d'impôts, il vous suffit de<span class="cursor">▌</span>`)}</div>
`)}
${prog(1)}
<div class="swipe">${ARROW}</div>
</div>`);

/* ---------------- SLIDE 2 ---------------- */
slides.push(`<div class="slide dark">
<div class="grid tl"></div>
${num(2)}
${head('• ÇA SE PASSE EN CE MOMENT')}
${content(`
<div class="title">Chaque jour, certains<br><span class="k">EXÉCUTENT</span> la réponse.</div>
<div style="margin-top:64px;width:760px">${bubble(`Comment payer moins d'impôts ?`)}</div>
<div style="margin-top:28px;margin-left:160px;width:760px">${bubble(`Quelle structure pour mon business ?`)}</div>
<div class="body" style="margin-top:72px">Sans vérification. Sans dossier. Sans filet.</div>
<div class="punch" style="margin-top:56px">Les dégâts, eux, arrivent avec 2 ou 3 ans de retard.</div>
`)}
${prog(2)}
</div>`);

/* ---------------- SLIDE 3 — DANGER 1 ---------------- */
slides.push(`<div class="slide dark">
<div class="grid br"></div>
${num(3)}
${head('• DANGER N°1', true)}
${content(`
<div class="title" style="font-size:112px">Les règles<br><span class="k">périmées.</span></div>
<div style="position:relative;margin-top:74px">
${bubble(`Le régime RNH du Portugal vous permet de bénéficier de...<span class="cursor">▌</span>`)}
<div class="stamp" style="right:-10px;top:-62px">FERMÉ EN 2023</div>
</div>
<div class="body" style="margin-top:84px">Une IA peut te recommander avec un aplomb parfait un régime fiscal mort depuis des années.</div>
<div class="punch" style="margin-top:96px">Tu le découvres une fois installé. Trop tard.</div>
`)}
${prog(3)}
</div>`);

/* ---------------- SLIDE 4 — DANGER 2 ---------------- */
const struck = ['Ta famille','Tes clients','Ton historique','Tes contrats','Tes projets']
  .map(t=>`<div style="position:relative;display:inline-block;font-weight:800;font-size:34px;line-height:1;color:#FFFFFF;padding:2px 0">${t}
  <span style="position:absolute;left:-6px;right:-6px;top:50%;height:2px;background:${BLUE};transform:translateY(-1px)"></span></div>`)
  .join('');
slides.push(`<div class="slide dark">
<div class="grid tl"></div>
${num(4)}
${head('• DANGER N°2', true)}
${content(`
<div class="title" style="font-size:112px">La réponse<br><span class="k">moyenne.</span></div>
<div class="card" style="margin-top:74px;padding:40px 44px 36px">
<div style="display:flex;flex-direction:column;align-items:flex-start;gap:20px">${struck}</div>
<div class="mono" style="margin-top:30px;font-size:24px;font-weight:500;color:${BLUE};letter-spacing:.04em">données non fournies</div>
</div>
<div class="body" style="margin-top:64px">Elle te donne la réponse moyenne d'Internet. En fiscalité, la moyenne appliquée au mauvais profil est une bombe à retardement.</div>
`)}
${prog(4)}
</div>`);

/* ---------------- SLIDE 5 — DANGER 3 ---------------- */
const tag = (t) => `<span class="mono" style="display:inline-block;vertical-align:middle;margin-right:10px;padding:3px 10px;border:1px solid ${BLUE};border-radius:6px;font-size:17px;font-weight:700;letter-spacing:.1em;color:${BLUE};line-height:1.2;transform:translateY(-3px)">${t}</span>`;
const hl = (op, t) => `<span style="background:rgba(67,83,255,${op});border-radius:6px;padding:2px 6px;box-decoration-break:clone;-webkit-box-decoration-break:clone">${t}</span>`;
slides.push(`<div class="slide dark">
<div class="grid br"></div>
${num(5)}
${head('• DANGER N°3', true)}
${content(`
<div class="title" style="font-size:112px">L'erreur<br><span class="k glitch" data-text="invisible.">invisible.</span></div>
<div style="margin-top:74px">${bubble(`${tag('VRAI')}${hl('.2','Les dividendes sont soumis au prélèvement forfaitaire unique de 30%.')}<br>${tag('FAUX')}${hl('.5','Les plus-values crypto sont totalement exonérées sous 10 000€ par an.')}<span class="cursor">▌</span>`)}</div>
<div class="body" style="margin-top:72px">Elle mélange le vrai et le faux dans la même réponse fluide. Pour repérer l'erreur, il faudrait déjà être expert.</div>
<div class="punch" style="margin-top:64px">Tu avances confiant. Directement vers le mur.</div>
`)}
${prog(5)}
</div>`);

/* ---------------- SLIDE 6 — DANGER 4 ---------------- */
slides.push(`<div class="slide dark">
<div class="grid tl"></div>
${num(6)}
${head('• DANGER N°4', true)}
${content(`
<div class="title" style="font-size:96px">Personne ne paiera<br><span class="k">à ta place.</span></div>
<div style="position:relative;margin-top:74px">
${bubble(`Je ne peux pas être tenue responsable de...<span class="cursor">▌</span>`)}
<div class="stamp" style="right:-10px;top:-62px">AUCUNE GARANTIE</div>
</div>
<div class="body" style="margin-top:84px;font-size:34px">Un expert engage sa responsabilité professionnelle. Une IA ne signe rien. Le contrôle tombe ? Redressement, pénalités, intérêts : tout est pour toi.</div>
<div class="punch" style="margin-top:84px">Elle, elle s'excusera. Gratuitement.</div>
`)}
${prog(6)}
</div>`);

/* ---------------- SLIDE 7 — SCÉNARIO ---------------- */
const dot = (top) => `<i style="position:absolute;left:-52px;top:${top}px;width:26px;height:26px;border-radius:50%;background:${BLUE};box-shadow:0 0 0 6px rgba(67,83,255,.25)"></i>`;
slides.push(`<div class="slide dark">
<div class="hazard top"></div><div class="hazard bottom"></div>
<div class="grid br"></div>
${num(7)}
${head('• LE SCÉNARIO QUI SE RÉPÈTE')}
${content(`
<div class="title">La LLC conseillée<br><span class="k">par l'IA.</span></div>
<div class="card" style="margin-top:64px;padding:44px 44px 40px">
  <div style="position:relative;padding-left:52px">
    <div style="position:absolute;left:12px;top:14px;bottom:124px;width:2px;background:rgba(67,83,255,.35)"></div>
    <div style="position:relative;margin-bottom:34px">${dot(6)}
      <div class="body" style="font-size:32px;line-height:1.3">Il monte sa LLC. Personne ne lui parle du formulaire 5472.</div></div>
    <div style="position:relative;margin-bottom:34px">${dot(6)}
      <div class="body" style="font-size:32px;line-height:1.3;color:#8A8FA3">Trois ans passent.</div></div>
    <div style="position:relative">${dot(16)}
      <div class="mono" style="font-size:96px;font-weight:700;line-height:1;letter-spacing:-0.03em;color:#FFFFFF">25<span style="display:inline-block;width:.3em"></span>000$</div>
      <div class="body" style="font-size:32px;line-height:1.3;margin-top:12px">de pénalité par année manquée.</div></div>
  </div>
</div>
<div class="punch" style="margin-top:72px;font-size:34px">L'IA n'avait pas menti. Elle avait juste oublié. Et l'oubli d'une machine, c'est toi qui le paies.</div>
`)}
${prog(7)}
</div>`);

/* ---------------- SLIDE 8 — LA LIMITE (clair) ---------------- */
slides.push(`<div class="slide light">
<div class="grid tl"></div>
${num(8)}
${head('• LA LIMITE')}
${content(`
<div class="title">L'IA pour explorer.<br>L'expert pour <span class="k">DÉCIDER.</span></div>
<div class="body" style="margin-top:72px">Comprendre un concept, préparer tes questions : parfait. Décider une structure, un départ, un montage : jamais seul.</div>
<div class="card" style="margin-top:96px;padding:44px 48px">
<div class="body" style="font-size:34px;line-height:1.35">Ce sont des décisions à 5 ou 6 chiffres, engageantes sur des années. Un prompt de deux lignes ne remplacera jamais un dossier étudié.</div>
</div>
`)}
${prog(8)}
</div>`);

/* ---------------- SLIDE 9 — CTA (clair) ---------------- */
slides.push(`<div class="slide light">
<div class="grid br"></div>
${num(9)}
${head('• AVANT D’EXÉCUTER')}
${content(`
<div class="title">Un projet validé par l'IA ?<br>Fais-le vérifier<br>par une <span class="k">humaine.</span></div>
<div class="body" style="margin-top:72px">8 ans d'expertise. +800 entrepreneurs accompagnés.</div>
<div class="card blue" style="margin-top:72px;height:150px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0">
<div style="font-weight:800;font-size:58px;letter-spacing:-0.01em;line-height:1">Commente EXPERT</div>
</div>
<div class="sub" style="margin-top:56px;font-size:32px;color:#8A8FA3">L'échange est offert. Le redressement, lui, ne l'est pas.</div>
`)}
${prog(9)}
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
    const file = path.join(HTML_DIR, `slide-${String(n).padStart(2,'0')}.html`);
    fs.writeFileSync(file, html);
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    // titres : réduit la taille jusqu'à ce que chaque ligne (nowrap) tienne dans 920px
    const fitted = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.title').forEach(el => {
        let fs = parseFloat(getComputedStyle(el).fontSize);
        while (el.scrollWidth > el.clientWidth && fs > 56) { fs -= 1; el.style.fontSize = fs + 'px'; }
        out.push(fs);
      });
      return out;
    });
    console.log(`slide ${n} title px:`, fitted.join(','));
    // vérification : aucun texte ne déborde du cadre
    const overflow = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.slide *').forEach(el => {
        if (!el.textContent.trim() || el.closest('.num') || el.classList.contains('glitch')) return;
        const r = el.getBoundingClientRect();
        if (r.right > 1080 + 0.5 || r.bottom > 1350 + 0.5 || r.left < -0.5 || r.top < -0.5) bad.push(el.className + ' ' + el.textContent.trim().slice(0, 30));
        if (el.scrollWidth > el.clientWidth + 1 && !el.querySelector('.stamp') && !el.closest('.bubble')) bad.push('wider ' + el.className + ' ' + el.textContent.trim().slice(0, 30));
      });
      const c = document.querySelector('.content').getBoundingClientRect();
      if (c.bottom > 1230) bad.push('content bottom ' + Math.round(c.bottom));
      [].forEach(el => {
      });
      return bad;
    });
    if (overflow.length) console.warn(`slide ${n} overflow:`, overflow);
    await page.screenshot({ path: path.join(OUT, `slide-${String(n).padStart(2,'0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log('ok slide', n);
  }
  await browser.close();
})();
