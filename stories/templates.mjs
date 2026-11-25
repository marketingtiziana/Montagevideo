// FYNOVATES — Instagram Stories design system (1080x1920)
// Nine template families. Each template is a function (data, opts) -> HTML.
// Texts, photos and options live in content.mjs; this file holds the layout only.
import fs from 'fs';
import path from 'path';

export const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const PHOTOS = path.join(ROOT, '..', 'instagram', 'assets', 'photos');
const ff = (f) => 'file://' + path.join(FONTS, f);
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand', 'wordmark-3x.png')).toString('base64');
const RATIO = 76 / 1110;

// ---------- design tokens ----------
export const C = { navy: '#0D082E', ink: '#0A0722', white: '#FFFFFF', paper: '#F5F5F7', mute: '#6B6980', line: 'rgba(13,8,46,.14)' };
const THEMES = {
  navy: { bg: C.navy, fg: C.white, mute: 'rgba(255,255,255,.66)', line: 'rgba(255,255,255,.24)', card: 'rgba(255,255,255,.07)' },
  white: { bg: C.white, fg: C.navy, mute: C.mute, line: C.line, card: C.paper },
  paper: { bg: C.paper, fg: C.navy, mute: C.mute, line: C.line, card: C.white },
};
// safe area: Instagram UI covers roughly the top 250 px and the bottom 300 px
export const SAFE = { top: 250, bottom: 1600, x: 96 };

const photoURL = (k) => {
  const f = path.join(PHOTOS, `${k}-duo.jpg`);
  return 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
};
const imgURL = (file) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, file)).toString('base64');
const fix = (s = '') => String(s).replace(/ ([:?!;»])/g, ' $1').replace(/« /g, '« ').replace(/(\d) (\d{3})/g, '$1 $2').replace(/(\w)-(\w)/g, '$1‑$2');
const word = (w, c) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${c};-webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;

const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{background:${bg};position:relative;font-family:Inter;-webkit-font-smoothing:antialiased}
.a{position:absolute}
.cap{font:600 24px Mont;letter-spacing:.3em;text-transform:uppercase}
.h1{font:600 96px/1.06 Inter;letter-spacing:-.028em;text-wrap:balance}
.h2{font:600 72px/1.1 Inter;letter-spacing:-.024em;text-wrap:balance}
.body{font:400 42px/1.45 Inter;letter-spacing:-.005em}
.small{font:500 30px/1.4 Inter}
</style></head><body>${body}</body></html>`;

// ---------- shared pieces ----------
const header = (t, rubric) => `
  <div class="a" style="left:${SAFE.x}px;top:${SAFE.top}px">${word(230, t.fg)}</div>
  ${rubric ? `<div class="a cap" style="right:${SAFE.x}px;top:${SAFE.top - 4}px;color:${t.mute};text-align:right">${rubric}</div>` : ''}
  <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:${SAFE.top + 52}px;height:2px;background:${t.line}"></div>`;
const footer = (t, text = 'fynovates.com') => `
  <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:1528px;height:2px;background:${t.line}"></div>
  <div class="a small" style="left:${SAFE.x}px;top:1552px;color:${t.mute}">${fix(text)}</div>`;
const label = (t, text, top) => `<div class="a cap" style="left:${SAFE.x}px;top:${top}px;color:${t.mute}">${fix(text)}</div>`;
const photoBg = (k, pos = 'center', veil = .62) => `
  <div class="a" style="inset:0;background:url(${photoURL(k)}) ${pos}/cover"></div>
  <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(10,7,34,${Math.min(1, veil + .2)}) 0%,rgba(10,7,34,${veil}) 40%,rgba(10,7,34,${veil}) 62%,rgba(10,7,34,${Math.min(1, veil + .28)}) 100%)"></div>`;

// ---------- sticker mock-ups (previews only, never in the clean exports) ----------
const mockPoll = (opts, top) => `<div class="a" style="left:160px;right:160px;top:${top}px;background:#fff;border-radius:28px;box-shadow:0 10px 40px rgba(0,0,0,.25);padding:34px;display:grid;gap:18px">
  ${opts.map(o => `<div style="border:2px solid #E3E3E8;border-radius:16px;padding:22px 26px;font:600 34px Inter;color:#262626;text-align:center">${fix(o)}</div>`).join('')}</div>`;
const mockQuestion = (top, prompt = 'Pose ta question') => `<div class="a" style="left:180px;right:180px;top:${top}px;border-radius:28px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.25)">
  <div style="background:#262626;color:#fff;font:600 32px Inter;text-align:center;padding:30px">${prompt}</div>
  <div style="background:#fff;color:#9a9a9a;font:400 30px Inter;text-align:center;padding:34px">Écris quelque chose…</div></div>`;
const mockLink = (top, text = 'FYNOVATES.COM') => `<div class="a" style="left:50%;transform:translateX(-50%);top:${top}px;background:#fff;border-radius:18px;padding:22px 36px;font:600 32px Inter;color:#3B5BDB;box-shadow:0 10px 40px rgba(0,0,0,.25);white-space:nowrap">↗ ${text}</div>`;
const zone = (top, h, t, txt) => `<div class="a" style="left:160px;right:160px;top:${top}px;height:${h}px;border:2px dashed ${t.line};border-radius:28px;display:flex;align-items:center;justify-content:center;font:500 26px Inter;color:${t.mute}">${txt}</div>`;
// opts.mock: 'sticker' shows a simulated native sticker, 'guide' shows a dashed zone, false keeps it empty
const sticker = (o, kind, top, h, t, data) => !o.mock ? '' : o.mock === 'guide' ? zone(top, h, t, kind === 'link' ? 'Zone du sticker lien' : kind === 'question' ? 'Zone du sticker questions' : 'Zone du sticker sondage') :
  kind === 'poll' ? mockPoll(data, top) : kind === 'question' ? mockQuestion(top, data) : mockLink(top, data);

// =====================================================================
// 1 — ÉDUCATION (question, réponse, vrai ou faux, erreur, comparaison, mécanisme)
// =====================================================================
export const educ = {
  question: (d) => { const t = THEMES[d.theme || 'navy']; return page(t.bg, `
    ${d.photo ? photoBg(d.photo, d.pos) : ''}${header(t, d.rubric)}
    ${label(t, d.kicker || 'Question', 420)}
    <div class="a h1" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:${d.size || 104}px">${fix(d.title)}</div>
    ${d.lead ? `<div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.leadTop || 1080}px;color:${t.fg};opacity:.88">${fix(d.lead)}</div>` : ''}
    ${footer(t, d.foot || 'La réponse dans la story suivante →')}`); },
  reponse: (d) => { const t = THEMES[d.theme || 'white']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Réponse', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg}">${fix(d.title)}</div>
    <div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.bodyTop || 820}px;color:${t.fg};opacity:.9">${fix(d.body)}</div>
    ${d.note ? `<div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:1290px;background:${t.card};border-left:6px solid ${t.fg};padding:30px 36px;font:500 34px/1.4 Inter;color:${t.fg}">${fix(d.note)}</div>` : ''}
    ${footer(t, d.foot)}`); },
  vraifaux: (d) => { const t = THEMES[d.theme || 'navy']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Vrai ou faux ?', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:78px">${fix(d.statement)}</div>
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:1110px;display:flex;gap:28px">
      ${['Vrai', 'Faux'].map(v => `<div style="flex:1;border:2px solid ${t.line};border-radius:20px;padding:34px;text-align:center;font:600 48px Inter;color:${t.fg}">${v}</div>`).join('')}</div>
    ${footer(t, d.foot || 'Réponds, puis passe à la story suivante →')}`); },
  verdict: (d) => { const t = THEMES[d.theme || 'white']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, 'Réponse', 420)}
    <div class="a" style="left:${SAFE.x}px;top:470px;font:700 180px/1 Inter;letter-spacing:-.04em;color:${t.fg}">${d.verdict}</div>
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:700px;color:${t.fg};font-size:62px">${fix(d.title)}</div>
    <div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.bodyTop || 960}px;color:${t.fg};opacity:.9">${fix(d.body)}</div>
    ${footer(t, d.foot)}`); },
  erreur: (d) => { const t = THEMES[d.theme || 'navy']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Erreur fréquente', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg}">${fix(d.title)}</div>
    <div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.bodyTop || 820}px;color:${t.fg};opacity:.88">${fix(d.body)}</div>
    ${d.fix ? `<div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:1240px;border-top:2px solid ${t.line};padding-top:34px">
      <div class="cap" style="color:${t.mute};margin-bottom:16px">À faire</div><div style="font:500 38px/1.4 Inter;color:${t.fg}">${fix(d.fix)}</div></div>` : ''}
    ${footer(t, d.foot)}`); },
  comparaison: (d) => { const t = THEMES[d.theme || 'white']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Comparaison', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:64px">${fix(d.title)}</div>
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:${d.tableTop || 760}px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:10px">
        ${d.cols.map((c, i) => `<div style="background:${i ? t.card : t.fg};color:${i ? t.fg : t.bg};border-radius:16px;padding:24px 28px;font:600 34px Inter">${fix(c)}</div>`).join('')}</div>
      ${d.rows.map(([k, a, b]) => `<div style="padding:22px 0;border-bottom:2px solid ${t.line}">
        <div class="cap" style="color:${t.mute};font-size:20px;margin-bottom:12px">${fix(k)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;font:500 32px/1.35 Inter;color:${t.fg}"><div>${fix(a)}</div><div>${fix(b)}</div></div></div>`).join('')}</div>
    ${footer(t, d.foot)}`); },
  mecanisme: (d) => { const t = THEMES[d.theme || 'paper']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Le mécanisme', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:66px">${fix(d.title)}</div>
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:${d.listTop || 800}px">
      ${d.steps.map((s, i) => `<div style="display:flex;gap:34px;padding:30px 0;border-top:2px solid ${t.line}">
        <div style="font:600 34px Inter;color:${t.mute};font-variant-numeric:tabular-nums;min-width:56px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font:500 40px/1.35 Inter;color:${t.fg}">${fix(s)}</div></div>`).join('')}</div>
    ${footer(t, d.foot)}`); },
};

// =====================================================================
// 2 — SONDAGE (question + options + zone du sticker natif)
// =====================================================================
export const sondage = (d, o = {}) => { const t = THEMES[d.theme || 'navy']; const n = d.options.length; const zh = 160 + n * 112;
  return page(t.bg, `${d.photo ? photoBg(d.photo, d.pos, .7) : ''}${header(t, d.rubric)}
  ${label(t, d.kicker || 'Sondage', 420)}
  <div class="a h1" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:${d.size || 92}px">${fix(d.question)}</div>
  ${sticker(o, 'poll', d.stickerTop || 1500 - zh, zh, t, d.options)}
  ${footer(t, d.foot || 'Ta réponse reste anonyme pour les autres abonnés')}`); };

// =====================================================================
// 3 — BOÎTE À QUESTIONS (appel, question reçue)
// =====================================================================
export const questions = {
  appel: (d, o = {}) => { const t = THEMES[d.theme || 'navy']; return page(t.bg, `${d.photo ? photoBg(d.photo, d.pos, .72) : ''}${header(t, d.rubric)}
    ${label(t, d.kicker || 'Tes questions', 420)}
    <div class="a h1" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:${d.size || 92}px">${fix(d.title)}</div>
    ${d.lead ? `<div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.leadTop || 880}px;color:${t.fg};opacity:.85">${fix(d.lead)}</div>` : ''}
    ${sticker(o, 'question', 1150, 300, t, d.prompt || 'Pose ta question')}
    ${footer(t, d.foot || 'Réponses publiées cette semaine, sans nom ni détail personnel')}`); },
  recue: (d) => { const t = THEMES[d.theme || 'paper']; return page(t.bg, `${header(t, d.rubric)}
    ${label(t, d.kicker || 'Question reçue', 420)}
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:500px;background:${t.card};border-radius:32px;padding:56px 56px 60px">
      <div style="font:400 120px/0.6 Inter;color:${t.mute};height:60px">“</div>
      <div style="font:500 54px/1.3 Inter;letter-spacing:-.015em;color:${t.fg}">${fix(d.question)}</div>
      <div class="cap" style="color:${t.mute};margin-top:40px;font-size:20px">${fix(d.from || 'Question anonyme')}</div></div>
    ${footer(t, d.foot || 'Notre réponse dans la story suivante →')}`); },
};

// =====================================================================
// 4 — EXPERT (portrait en haut, ou vidéo plein écran avec bandeau)
// =====================================================================
export const expert = {
  portrait: (d) => { const t = THEMES.white; return page(t.bg, `
    <div class="a" style="left:0;top:0;width:1080px;height:1060px;background:url(${photoURL(d.photo)}) ${d.pos || 'center 25%'}/cover"></div>
    <div class="a" style="left:0;top:0;width:1080px;height:420px;background:linear-gradient(180deg,rgba(10,7,34,.72),rgba(10,7,34,0))"></div>
    <div class="a" style="left:${SAFE.x}px;top:${SAFE.top}px">${word(230, C.white)}</div>
    <div class="a cap" style="right:${SAFE.x}px;top:${SAFE.top - 4}px;color:rgba(255,255,255,.8)">${fix(d.rubric || 'La parole à nos experts')}</div>
    <div class="a" style="left:${SAFE.x}px;top:1110px;font:600 40px Inter;color:${C.navy}">${fix(d.name)}<span style="font-weight:400;color:${C.mute}"> · ${fix(d.role)}</span></div>
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:1180px;color:${C.navy};font-size:58px">${fix(d.topic)}</div>
    <div class="a" style="left:${SAFE.x}px;width:888px;top:${d.pointTop || 1340}px;font:400 36px/1.42 Inter;color:#2E2C45">${fix(d.point)}</div>`); },
  video: (d) => { const t = THEMES.navy; return page(t.bg, `${photoBg(d.photo, d.pos || 'center 25%', .25)}
    <div class="a" style="left:${SAFE.x}px;top:${SAFE.top}px">${word(230, C.white)}</div>
    <div class="a cap" style="right:${SAFE.x}px;top:${SAFE.top - 4}px;color:rgba(255,255,255,.85)">${fix(d.rubric || 'Vidéo · expert')}</div>
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:1150px;background:rgba(10,7,34,.88);border-radius:24px;padding:40px 44px">
      <div style="font:600 34px Inter;color:#fff">${fix(d.name)}<span style="font-weight:400;opacity:.7"> · ${fix(d.role)}</span></div>
      <div style="font:600 52px/1.15 Inter;letter-spacing:-.02em;color:#fff;margin-top:18px">${fix(d.topic)}</div>
      <div style="font:400 32px/1.42 Inter;color:rgba(255,255,255,.85);margin-top:18px">${fix(d.point)}</div></div>`); },
};

// =====================================================================
// 5 — COULISSES (la photo réelle est l'élément principal)
// =====================================================================
export const coulisses = {
  bas: (d) => page(C.navy, `${photoBg(d.photo, d.pos, .18)}
    <div class="a" style="left:0;right:0;bottom:0;height:900px;background:linear-gradient(180deg,rgba(10,7,34,0),rgba(10,7,34,.92) 55%)"></div>
    <div class="a" style="left:${SAFE.x}px;top:${SAFE.top}px">${word(230, C.white)}</div>
    <div class="a cap" style="right:${SAFE.x}px;top:${SAFE.top - 4}px;color:rgba(255,255,255,.85)">${fix(d.rubric || 'Coulisses')}</div>
    <div class="a cap" style="left:${SAFE.x}px;top:1150px;color:rgba(255,255,255,.75)">${fix(d.kicker || 'Au cabinet')}</div>
    <div class="a" style="left:${SAFE.x}px;width:888px;top:1205px;font:600 58px/1.15 Inter;letter-spacing:-.02em;color:#fff;text-wrap:balance">${fix(d.caption)}</div>`),
  cadre: (d) => { const t = THEMES.paper; return page(t.bg, `${header(t, d.rubric || 'Coulisses')}
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:360px;height:860px;border-radius:24px;background:url(${photoURL(d.photo)}) ${d.pos || 'center'}/cover"></div>
    ${label(t, d.kicker || 'Au cabinet', 1270)}
    <div class="a" style="left:${SAFE.x}px;width:888px;top:1320px;font:600 50px/1.18 Inter;letter-spacing:-.02em;color:${C.navy};text-wrap:balance">${fix(d.caption)}</div>`); },
};

// =====================================================================
// 6 — CAS CLIENT (couverture puis écrans narratifs numérotés)
// =====================================================================
const STEPS = ['Situation', 'Problème', 'Erreur', 'Conséquence', 'Enseignement'];
export const cas = {
  couverture: (d) => { const t = THEMES.navy; return page(t.bg, `${d.photo ? photoBg(d.photo, d.pos, .7) : ''}${header(t, d.rubric || 'Cas client')}
    ${label(t, d.kicker || 'Cas client · anonymisé', 420)}
    <div class="a h1" style="left:${SAFE.x}px;width:888px;top:480px;color:#fff;font-size:${d.size || 96}px">${fix(d.title)}</div>
    ${footer(t, d.foot || 'L’histoire en cinq stories →')}`); },
  etape: (d) => { const i = d.step; const last = i === STEPS.length - 1 || d.final; const t = THEMES[d.theme || (last ? 'white' : i % 2 ? 'navy' : 'paper')];
    return page(t.bg, `${header(t, d.rubric || 'Cas client')}
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:400px;display:flex;gap:10px">${STEPS.map((_, k) => `<div style="flex:1;height:6px;border-radius:3px;background:${k <= i ? t.fg : t.line}"></div>`).join('')}</div>
    <div class="a cap" style="left:${SAFE.x}px;top:450px;color:${t.mute}">${String(i + 1).padStart(2, '0')} · ${d.label || STEPS[i]}</div>
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:520px;color:${t.fg};font-size:${d.size || 66}px">${fix(d.title)}</div>
    ${d.body ? `<div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.bodyTop || 900}px;color:${t.fg};opacity:.9">${fix(d.body)}</div>` : ''}
    ${footer(t, d.foot || (last ? 'Une situation proche ? Écris-nous en message.' : 'Suite →'))}`); },
};

// =====================================================================
// 7 — ACTUALITÉ / ALERTE
// =====================================================================
export const alerte = (d) => { const t = THEMES[d.theme || 'white']; return page(t.bg, `${header(t, d.rubric || 'Actualité')}
  <div class="a" style="left:${SAFE.x}px;top:400px;display:flex;gap:18px;align-items:center">
    <div style="background:${t.fg};color:${t.bg};font:700 24px Mont;letter-spacing:.24em;padding:14px 22px;border-radius:8px">${fix(d.tag || 'ALERTE')}</div>
    <div style="font:600 30px Inter;color:${t.fg}">${fix(d.date)}</div></div>
  <div class="a h2" style="left:${SAFE.x}px;width:888px;top:500px;color:${t.fg};font-size:66px">${fix(d.title)}</div>
  <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:${d.gridTop || 820}px">
    ${[['Ce qui change', d.rule], ['Qui est concerné', d.who], ['En pratique', d.impact]].map(([k, v]) => `<div style="padding:28px 0;border-top:2px solid ${t.line}">
      <div class="cap" style="color:${t.mute};font-size:20px;margin-bottom:12px">${k}</div><div style="font:500 36px/1.4 Inter;color:${t.fg}">${fix(v)}</div></div>`).join('')}</div>
  ${footer(t, d.source ? `Source : ${d.source}` : undefined)}`); };

// =====================================================================
// 8 — CONVERSION (services, accompagnement, rendez-vous, message, site)
// =====================================================================
export const conversion = {
  services: (d) => { const t = THEMES.navy; return page(t.bg, `${header(t, d.rubric || 'Le cabinet')}
    ${label(t, d.kicker || 'Nos expertises', 420)}
    <div class="a h2" style="left:${SAFE.x}px;width:888px;top:480px;color:#fff;font-size:64px">${fix(d.title)}</div>
    <div class="a" style="left:${SAFE.x}px;right:${SAFE.x}px;top:${d.listTop || 760}px">${d.items.map(s => `<div style="padding:24px 0;border-top:2px solid ${t.line};font:500 38px Inter;color:#fff">${fix(s)}</div>`).join('')}</div>
    ${footer(t, d.foot || 'fynovates.com')}`); },
  etapes: (d) => educ.mecanisme({ ...d, theme: d.theme || 'white', kicker: d.kicker || 'Comment se déroule un accompagnement' }),
  cta: (d, o = {}) => { const t = THEMES[d.theme || 'navy']; return page(t.bg, `${d.photo ? photoBg(d.photo, d.pos, .72) : ''}${header(t, d.rubric || 'Le cabinet')}
    ${label(t, d.kicker || 'Échanger avec le cabinet', 420)}
    <div class="a h1" style="left:${SAFE.x}px;width:888px;top:480px;color:${t.fg};font-size:${d.size || 88}px">${fix(d.title)}</div>
    <div class="a body" style="left:${SAFE.x}px;width:860px;top:${d.textTop || 880}px;color:${t.fg};opacity:.88">${fix(d.text)}</div>
    ${d.button ? `<div class="a" style="left:${SAFE.x}px;top:${d.buttonTop || 1210}px;border:2px solid ${t.fg};border-radius:999px;padding:24px 44px;font:600 34px Inter;color:${t.fg}">${fix(d.button)}</div>` : ''}
    ${d.link ? sticker(o, 'link', 1360, 110, t, d.link) : ''}
    ${footer(t, d.foot || 'Le cabinet te répond personnellement')}`); },
};

// =====================================================================
// 9 — REPUBLICATION (le contenu d'origine reste visible et lisible)
// =====================================================================
export const republication = (d) => { const t = THEMES[d.theme || 'paper'];
  const formats = { vertical: [560, 996], portrait: [700, 875], paysage: [888, 500], texte: [888, 640] };
  const [w, h] = formats[d.format]; const top = d.format === 'vertical' ? 420 : d.format === 'portrait' ? 460 : 560;
  const media = d.format === 'texte'
    ? `<div style="width:${w}px;height:${h}px;background:#fff;border-radius:24px;box-shadow:0 12px 40px rgba(13,8,46,.12);padding:48px;display:flex;flex-direction:column;gap:26px">
        <div style="display:flex;gap:20px;align-items:center"><div style="width:84px;height:84px;border-radius:50%;background:${C.navy};display:flex;align-items:center;justify-content:center">${word(64, '#fff')}</div>
        <div><div style="font:600 32px Inter;color:#191919">FYNOVATES</div><div style="font:400 26px Inter;color:#666">Cabinet de conseil fiscal</div></div></div>
        <div style="font:400 34px/1.45 Inter;color:#191919">${fix(d.text)}</div></div>`
    : `<div style="width:${w}px;height:${h}px;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(13,8,46,.18);background:url(${imgURL(d.image)}) center/cover"></div>`;
  const capTop = top + h + 50;
  return page(t.bg, `${header(t, d.rubric || 'À voir')}
    <div class="a" style="left:0;right:0;top:${top}px;display:flex;justify-content:center">${media}</div>
    <div class="a cap" style="left:${SAFE.x}px;top:${capTop}px;color:${t.mute}">${fix(d.kicker)}</div>
    <div class="a" style="left:${SAFE.x}px;width:888px;top:${capTop + 46}px;font:600 50px/1.15 Inter;letter-spacing:-.02em;color:${t.fg}">${fix(d.title)}</div>`); };

// =====================================================================
// STORIES À LA UNE (couvertures de highlights)
// =====================================================================
export const une = (d) => page(C.navy, `
  <div class="a" style="left:140px;top:560px;width:800px;height:800px;border-radius:50%;border:3px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center">
    <div style="font:700 ${d.label.length > 10 ? 66 : d.label.length > 7 ? 76 : 88}px Mont;letter-spacing:.14em;color:#fff;padding-left:.14em;text-align:center">${fix(d.label.toUpperCase())}</div></div>`);
