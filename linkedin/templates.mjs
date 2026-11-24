// FYNOVATES — LinkedIn visual library: shared layout system + ten families.
// Texts live in content.mjs. Formats: P = 1080x1350 (4:5, feed + PDF pages), L = 1200x627 (landscape).
import fs from 'fs';
import path from 'path';

export const ROOT = path.dirname(new URL(import.meta.url).pathname);
const ff = (f) => 'file://' + path.join(ROOT, '..', 'banners', 'fonts', f);
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand', 'wordmark-3x.png')).toString('base64');
export const SIZES = { P: [1080, 1350], L: [1200, 627] };
const C = { navy: '#0D082E', white: '#FFFFFF', paper: '#F5F5F7', mute: '#6B6980', text: '#2E2C45', line: 'rgba(13,8,46,.14)', hold: '#E7E7EE' };
const TH = {
  navy: { bg: C.navy, fg: '#fff', mute: 'rgba(255,255,255,.66)', text: 'rgba(255,255,255,.9)', line: 'rgba(255,255,255,.22)', card: 'rgba(255,255,255,.06)' },
  white: { bg: C.white, fg: C.navy, mute: C.mute, text: C.text, line: C.line, card: C.paper },
  paper: { bg: C.paper, fg: C.navy, mute: C.mute, text: C.text, line: C.line, card: C.white },
};
export const fix = (s = '') => String(s).replace(/ ([:?!;»%])/g, ' $1').replace(/« /g, '« ').replace(/(\d) (\d{3})/g, '$1 $2').replace(/(\w)-(\w)/g, '$1‑$2');
const word = (w, c) => `<div style="width:${w}px;height:${(w * 76 / 1110).toFixed(2)}px;background:${c};-webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
export const page = (size, bg, body) => { const [w, h] = SIZES[size];
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};position:relative;font-family:Inter;-webkit-font-smoothing:antialiased}.a{position:absolute}
.cap{font:600 20px Mont;letter-spacing:.28em;text-transform:uppercase}
.tab{font-variant-numeric:tabular-nums}
@page{size:${w}px ${h}px;margin:0}
</style></head><body>${body}</body></html>`; };

// ---------- shared furniture (P format) ----------
const M = 88; // outer margin
const head = (t, rubric, right) => `
  <div class="a" style="left:${M}px;top:${M}px">${word(210, t.fg)}</div>
  <div class="a cap" style="right:${M}px;top:${M - 3}px;color:${t.mute};text-align:right">${fix(right || rubric || '')}</div>
  <div class="a" style="left:${M}px;right:${M}px;top:${M + 46}px;height:2px;background:${t.line}"></div>`;
const foot = (t, left = 'Conseil fiscal & structuration internationale', right = 'fynovates.com') => `
  <div class="a" style="left:${M}px;right:${M}px;bottom:${M + 44}px;height:2px;background:${t.line}"></div>
  <div class="a" style="left:${M}px;bottom:${M}px;font:500 22px Inter;color:${t.mute}">${fix(left)}</div>
  <div class="a" style="right:${M}px;bottom:${M}px;font:500 22px Inter;color:${t.mute}">${fix(right)}</div>`;
const kicker = (t, s, top) => `<div class="a cap" style="left:${M}px;top:${top}px;color:${t.mute}">${fix(s)}</div>`;
const H = (t, s, top, size = 70, w = 904) => `<div class="a" style="left:${M}px;width:${w}px;top:${top}px;font:600 ${size}px/1.1 Inter;letter-spacing:-.024em;color:${t.fg};text-wrap:balance">${fix(s)}</div>`;
const P = (t, s, top, size = 32, w = 880) => `<div class="a" style="left:${M}px;width:${w}px;top:${top}px;font:400 ${size}px/1.5 Inter;color:${t.text}">${fix(s)}</div>`;
const reserve = (t, s) => s ? `<div class="a" style="left:${M}px;right:${M}px;bottom:${M + 74}px;font:400 21px/1.45 Inter;color:${t.mute}"><b style="font-weight:600">Réserve :</b> ${fix(s)}</div>` : '';
// placeholder for a missing resource (photo, logo, name): visible and explicit
export const hold = (w, h, label, dark) => `<div style="width:${w}px;height:${h}px;background:${dark ? 'rgba(255,255,255,.08)' : C.hold};border:2px dashed ${dark ? 'rgba(255,255,255,.35)' : 'rgba(13,8,46,.28)'};border-radius:12px;display:flex;align-items:center;justify-content:center;text-align:center;font:600 18px Mont;letter-spacing:.2em;color:${dark ? 'rgba(255,255,255,.6)' : C.mute};padding:16px">${label}</div>`;

// =====================================================================
// 1 — PUBLICATION ÉDITORIALE SIMPLE (3 compositions)
// =====================================================================
export const editorial = {
  // A: navy, statement centred in the page
  a: (d) => { const t = TH.navy; return page('P', t.bg, `${head(t, d.rubric)}
    ${kicker(t, d.kicker || 'Point de vigilance', 430)}
    ${H(t, d.title, 486, d.size || 84)}
    ${foot(t)}`); },
  // B: white, statement + a short explanation separated by a rule
  b: (d) => { const t = TH.white; return page('P', t.bg, `${head(t, d.rubric)}
    ${H(t, d.title, 300, d.size || 76)}
    <div class="a" style="left:${M}px;width:120px;top:${d.ruleTop || 780}px;height:4px;background:${C.navy}"></div>
    ${P(t, d.body, (d.ruleTop || 780) + 50, 34)}
    ${foot(t)}`); },
  // C: paper, oversized quotation-style statement with a "À retenir" block at the foot
  c: (d) => { const t = TH.paper; return page('P', t.bg, `${head(t, d.rubric)}
    ${H(t, d.title, 260, d.size || 80)}
    <div class="a" style="left:${M}px;right:${M}px;top:${d.boxTop || 900}px;background:#fff;border-radius:16px;padding:36px 40px">
      <div class="cap" style="color:${C.mute};margin-bottom:14px">À retenir</div>
      <div style="font:500 30px/1.45 Inter;color:${C.navy}">${fix(d.body)}</div></div>
    ${foot(t)}`); },
};

// =====================================================================
// 2 — DOCUMENT PDF (pages 1080x1350)
// =====================================================================
export const doc = {
  cover: (d) => { const t = TH.navy; return page('P', t.bg, `
    <div class="a" style="left:${M}px;top:${M}px">${word(240, '#fff')}</div>
    <div class="a cap" style="right:${M}px;top:${M - 3}px;color:${t.mute}">${fix(d.series || 'Note pédagogique')}</div>
    ${kicker(t, d.kicker, 470)}
    ${H(t, d.title, 530, d.size || 76)}
    <div class="a" style="left:${M}px;width:820px;top:${d.subTop || 900}px;font:400 32px/1.45 Inter;color:${t.text}">${fix(d.sub)}</div>
    <div class="a" style="left:${M}px;right:${M}px;bottom:${M + 44}px;height:2px;background:${t.line}"></div>
    <div class="a" style="left:${M}px;bottom:${M}px;font:500 22px Inter;color:${t.mute}">${fix(d.meta || 'Document de 8 pages')}</div>
    <div class="a" style="right:${M}px;bottom:${M}px;font:500 22px Inter;color:${t.mute}">Faites défiler →</div>`); },
  section: (d) => { const t = TH[d.theme || 'white']; return page('P', t.bg, `${head(t, d.doc, `${String(d.n).padStart(2, '0')} / ${String(d.total).padStart(2, '0')}`)}
    ${kicker(t, d.kicker, 230)}
    ${H(t, d.title, 280, d.size || 62)}
    ${d.body ? P(t, d.body, d.bodyTop || 560, 32) : ''}
    ${d.list ? `<div class="a" style="left:${M}px;right:${M}px;top:${d.listTop || 560}px">${d.list.map((x, i) => `<div style="display:grid;grid-template-columns:${d.numbered ? '70px ' : ''}1fr;gap:20px;padding:24px 0;border-top:2px solid ${t.line}">
      ${d.numbered ? `<div class="tab" style="font:600 30px Inter;color:${t.mute}">${String(i + 1).padStart(2, '0')}</div>` : ''}
      <div>${Array.isArray(x) ? `<div style="font:600 32px/1.3 Inter;color:${t.fg}">${fix(x[0])}</div><div style="font:400 26px/1.45 Inter;color:${t.text};margin-top:8px">${fix(x[1])}</div>` : `<div style="font:500 32px/1.35 Inter;color:${t.fg}">${fix(x)}</div>`}</div></div>`).join('')}</div>` : ''}
    ${d.table ? table(t, d.table, d.tableTop || 560) : ''}
    ${d.note ? `<div class="a" style="left:${M}px;right:${M}px;bottom:${M + 90}px;background:${t.card};border-left:6px solid ${t.fg};padding:26px 32px;font:500 26px/1.45 Inter;color:${t.fg}">${fix(d.note)}</div>` : ''}
    ${foot(t, d.foot || d.doc)}`); },
  end: (d) => { const t = TH.navy; return page('P', t.bg, `${head(t, d.doc, `${String(d.n).padStart(2, '0')} / ${String(d.total).padStart(2, '0')}`)}
    ${kicker(t, 'Conclusion', 230)}
    ${H(t, d.title, 280, 60)}
    ${P(t, d.body, d.bodyTop || 560, 32)}
    <div class="a" style="left:${M}px;right:${M}px;top:${d.sigTop || 930}px;border-top:2px solid ${t.line};padding-top:40px">
      <div style="margin-bottom:24px">${word(300, '#fff')}</div>
      <div style="font:400 26px/1.5 Inter;color:${t.text}">Fiscalité · TVA · Comptabilité · Structuration · Banque · Résidence fiscale</div>
      <div style="font:600 28px Inter;color:#fff;margin-top:24px">${fix(d.cta || 'Échangeons sur votre situation : fynovates.com')}</div></div>
    <div class="a" style="left:${M}px;right:${M}px;bottom:${M}px;font:400 20px/1.45 Inter;color:${t.mute}">${fix(d.legal || 'Document d’information générale. Il ne constitue pas un conseil personnalisé : chaque situation doit être analysée individuellement.')}</div>`); },
};

// table helper (used by PDF pages and comparison visuals)
function table(t, tb, top, opts = {}) {
  const cols = tb.cols.length, w = opts.first || 230;
  return `<div class="a" style="left:${M}px;right:${M}px;top:${top}px">
    <div style="display:grid;grid-template-columns:${w}px repeat(${cols},1fr);gap:0 24px;padding-bottom:16px;border-bottom:3px solid ${t.fg}">
      <div></div>${tb.cols.map(c => `<div style="font:600 28px/1.25 Inter;color:${t.fg}">${fix(c)}</div>`).join('')}</div>
    ${tb.rows.map(r => `<div style="display:grid;grid-template-columns:${w}px repeat(${cols},1fr);gap:0 24px;padding:${opts.pad || 20}px 0;border-bottom:2px solid ${t.line}">
      <div class="cap" style="font-size:17px;line-height:1.5;color:${t.mute};letter-spacing:.18em">${fix(r[0])}</div>
      ${r.slice(1).map(v => `<div style="font:400 ${opts.fs || 25}px/1.42 Inter;color:${t.text}">${fix(v)}</div>`).join('')}</div>`).join('')}</div>`;
}

// =====================================================================
// 3 — INFOGRAPHIE TECHNIQUE
// =====================================================================
export const infographie = {
  // vertical cascade: amount → what is taken off → next amount
  cascade: (d) => { const t = TH.white; let y = d.top || 430; let s = '';
    d.levels.forEach((lv, i) => {
      s += `<div class="a" style="left:${M}px;right:${M}px;top:${y}px;background:${i === d.levels.length - 1 ? C.navy : i === 0 ? C.paper : '#EDEDF3'};border-radius:14px;padding:26px 34px;display:flex;justify-content:space-between;align-items:baseline">
        <div style="font:600 38px Inter;color:${i === d.levels.length - 1 ? '#fff' : C.navy}">${fix(lv[0])}</div>
        <div style="font:400 24px Inter;color:${i === d.levels.length - 1 ? 'rgba(255,255,255,.75)' : C.mute};max-width:470px;text-align:right">${fix(lv[1])}</div></div>`;
      y += 118;
      if (d.steps[i]) { s += `<div class="a" style="left:${M + 40}px;right:${M}px;top:${y}px;display:flex;gap:26px;align-items:flex-start">
          <div style="width:2px;height:${d.stepH || 150}px;background:${C.navy};opacity:.35;margin-left:10px"></div>
          <div style="padding-top:8px"><div class="cap" style="color:${C.mute};font-size:17px;margin-bottom:10px">${fix(d.steps[i][0])}</div>
          <div style="font:400 26px/1.45 Inter;color:${C.text}">${fix(d.steps[i][1])}</div></div></div>`; y += (d.stepH || 150) + 20; }
    });
    return page('P', t.bg, `${head(t, d.rubric)}${kicker(t, d.kicker || 'Infographie', 210)}${H(t, d.title, 255, 50)}${s}${reserve(t, d.reserve)}${foot(t)}`); },
  // numbered decision steps with a short question and what it determines
  etapes: (d) => { const t = TH.paper; const top = d.top || 470, gap = d.gap || 178;
    const s = d.steps.map((st, i) => `<div class="a" style="left:${M}px;right:${M}px;top:${top + i * gap}px;display:grid;grid-template-columns:96px 1fr;gap:26px">
      <div style="width:76px;height:76px;border-radius:50%;background:${i === d.steps.length - 1 && d.lastDark ? C.navy : '#fff'};border:2px solid ${C.navy};display:flex;align-items:center;justify-content:center;font:600 30px Inter;color:${i === d.steps.length - 1 && d.lastDark ? '#fff' : C.navy}" class="tab">${i + 1}</div>
      <div><div style="font:600 34px/1.25 Inter;color:${C.navy}">${fix(st[0])}</div><div style="font:400 25px/1.45 Inter;color:${C.text};margin-top:8px">${fix(st[1])}</div></div></div>`).join('');
    const rail = `<div class="a" style="left:${M + 37}px;top:${top + 76}px;width:2px;height:${(d.steps.length - 1) * gap - 76}px;background:${C.navy};opacity:.25"></div>`;
    return page('P', t.bg, `${head(t, d.rubric)}${kicker(t, d.kicker || 'Infographie', 210)}${H(t, d.title, 255, 50)}${rail}${s}${reserve(t, d.reserve)}${foot(t)}`); },
};

// =====================================================================
// 4 — TABLEAU COMPARATIF
// =====================================================================
export const comparatif = (d) => { const t = TH.white; return page('P', t.bg, `${head(t, d.rubric)}
  ${kicker(t, d.kicker || 'Comparaison', 210)}${H(t, d.title, 255, d.size || 52)}
  ${table(t, d.table, d.tableTop || 470, { first: d.first || 210, fs: d.fs || 24, pad: d.pad || 18 })}
  ${reserve(t, d.reserve)}${foot(t)}`); };

// =====================================================================
// 5 — CAS CLIENT (single visual, four blocks)
// =====================================================================
export const cas = (d) => { const t = TH.white;
  const blocks = [['Situation', d.situation], ['Difficulté', d.difficulte], ['Analyse', d.analyse], ['Enseignement', d.enseignement]];
  return page('P', t.bg, `
  <div class="a" style="left:0;right:0;top:0;height:${d.headH || 520}px;background:${C.navy}"></div>
  <div class="a" style="left:${M}px;top:${M}px">${word(210, '#fff')}</div>
  <div class="a cap" style="right:${M}px;top:${M - 3}px;color:rgba(255,255,255,.66)">Cas client · anonymisé</div>
  <div class="a cap" style="left:${M}px;top:210px;color:rgba(255,255,255,.66)">${fix(d.theme)}</div>
  <div class="a" style="left:${M}px;width:904px;top:256px;font:600 48px/1.16 Inter;letter-spacing:-.02em;color:#fff;text-wrap:balance">${fix(d.title)}</div>
  <div class="a" style="left:${M}px;right:${M}px;top:${(d.headH || 520) + 50}px;display:grid;grid-template-columns:1fr 1fr;gap:28px 40px">
    ${blocks.map(([k, v], i) => `<div style="border-top:${i === 3 ? 4 : 2}px solid ${i === 3 ? C.navy : C.line};padding-top:22px">
      <div class="cap" style="color:${C.mute};font-size:17px;margin-bottom:12px">${String(i + 1).padStart(2, '0')} · ${k}</div>
      <div style="font:${i === 3 ? 500 : 400} 25px/1.45 Inter;color:${i === 3 ? C.navy : C.text}">${fix(v)}</div></div>`).join('')}</div>
  ${foot(t, 'Situation réelle, anonymisée et simplifiée')}`); };

// =====================================================================
// 6 — NOTE D'INFORMATION / ALERTE RÉGLEMENTAIRE
// =====================================================================
export const note = (d) => { const t = TH.white; return page('P', t.bg, `${head(t, d.rubric || 'Note d’information')}
  <div class="a" style="left:${M}px;top:210px;display:flex;gap:16px;align-items:center">
    <div style="border:2px solid ${C.navy};color:${C.navy};font:700 18px Mont;letter-spacing:.22em;padding:10px 16px;border-radius:6px">${fix(d.tag || 'NOTE')}</div>
    <div style="font:500 24px Inter;color:${C.mute}">${fix(d.date)}</div></div>
  ${H(t, d.title, 290, d.size || 54)}
  <div class="a" style="left:${M}px;right:${M}px;top:${d.gridTop || 560}px">
    ${[['Qui est concerné', d.who], ['Ce qui change', d.what], ['Implications pratiques', d.impact]].map(([k, v]) => `<div style="display:grid;grid-template-columns:250px 1fr;gap:28px;padding:26px 0;border-top:2px solid ${C.line}">
      <div class="cap" style="color:${C.mute};font-size:17px;line-height:1.5">${k}</div><div style="font:400 26px/1.45 Inter;color:${C.text}">${fix(v)}</div></div>`).join('')}</div>
  ${reserve(t, d.source ? `Source : ${d.source}.` : '')}${foot(t)}`); };

// =====================================================================
// 7 — CITATION / POINT DE VUE D'EXPERT
// =====================================================================
export const citation = {
  a: (d) => { const t = TH.navy; return page('P', t.bg, `${head(t, 'Point de vue')}
    <div class="a" style="left:${M - 6}px;top:300px;font:600 200px/1 Inter;color:rgba(255,255,255,.18)">“</div>
    <div class="a" style="left:${M}px;width:904px;top:470px;font:500 64px/1.2 Inter;letter-spacing:-.02em;color:#fff;text-wrap:balance">${fix(d.quote)}</div>
    <div class="a" style="left:${M}px;top:${d.sigTop || 1000}px;border-top:2px solid ${t.line};padding-top:28px;width:904px">
      <div style="font:600 30px Inter;color:#fff">${fix(d.name)}</div><div style="font:400 26px Inter;color:${t.mute};margin-top:6px">${fix(d.role)}</div></div>
    ${foot(t)}`); },
  b: (d) => { const t = TH.paper; return page('P', t.bg, `${head(t, 'Point de vue')}
    <div class="a" style="left:${M}px;width:904px;top:280px;font:500 58px/1.22 Inter;letter-spacing:-.02em;color:${C.navy};text-wrap:balance">« ${fix(d.quote)} »</div>
    <div class="a" style="left:${M}px;top:${d.sigTop || 930}px;display:flex;gap:28px;align-items:center">
      <div style="border-radius:50%;overflow:hidden">${hold(150, 150, 'PHOTO')}</div>
      <div><div style="font:600 30px Inter;color:${C.navy}">${fix(d.name)}</div><div style="font:400 26px Inter;color:${C.mute};margin-top:6px">${fix(d.role)}</div></div></div>
    ${foot(t)}`); },
};

// =====================================================================
// 8 — PRÉSENTATION D'EXPERT / ÉQUIPE
// =====================================================================
export const expert = {
  portrait: (d) => { const t = TH.white; return page('P', t.bg, `
    <div class="a" style="left:0;top:0">${hold(1080, 720, 'PHOTO PROFESSIONNELLE À INSÉRER<br>1080 × 720 px')}</div>
    <div class="a" style="left:${M}px;top:${M}px;background:#fff;padding:14px 18px;border-radius:8px">${word(190, C.navy)}</div>
    <div class="a cap" style="left:${M}px;top:780px;color:${C.mute}">${fix(d.serie || 'Notre équipe')}</div>
    <div class="a" style="left:${M}px;top:826px;font:600 54px/1.1 Inter;letter-spacing:-.02em;color:${C.navy}">${fix(d.name)}</div>
    <div class="a" style="left:${M}px;top:900px;font:500 30px Inter;color:${C.mute}">${fix(d.role)}</div>
    <div class="a" style="left:${M}px;top:970px;display:flex;flex-wrap:wrap;gap:12px;width:904px">${d.domains.map(x => `<div style="border:2px solid ${C.navy};border-radius:999px;padding:10px 20px;font:500 22px Inter;color:${C.navy}">${fix(x)}</div>`).join('')}</div>
    ${P(t, d.bio, 1060, 27, 904)}
    ${foot(t)}`); },
  equipe: (d) => { const n = d.members.length; const w = Math.floor((1200 - 2 * 64 - (n - 1) * 24) / n);
    return page('L', C.paper, `
    <div class="a" style="left:64px;top:52px">${word(180, C.navy)}</div>
    <div class="a cap" style="right:64px;top:50px;color:${C.mute};font-size:16px">${fix(d.rubric || 'Notre équipe')}</div>
    <div class="a" style="left:64px;width:1072px;top:96px;font:600 32px/1.15 Inter;letter-spacing:-.02em;color:${C.navy}">${fix(d.title)}</div>
    <div class="a" style="left:64px;right:64px;top:170px;display:grid;grid-template-columns:repeat(${n},1fr);gap:24px">
      ${d.members.map(m => `<div>${hold(w, 260, 'PHOTO')}<div style="font:600 21px Inter;color:${C.navy};margin-top:14px">${fix(m[0])}</div><div style="font:400 18px/1.35 Inter;color:${C.mute};margin-top:4px">${fix(m[1])}</div></div>`).join('')}</div>`); },
};

// =====================================================================
// 9 — MÉTHODOLOGIE ET PROCESSUS
// =====================================================================
export const methode = {
  // horizontal process on a landscape canvas
  ligne: (d) => { const n = d.steps.length; const w = (1200 - 128 - (n - 1) * 16) / n;
    return page('L', '#fff', `
    <div class="a" style="left:64px;top:52px">${word(180, C.navy)}</div>
    <div class="a cap" style="right:64px;top:50px;color:${C.mute};font-size:16px">${fix(d.rubric || 'Notre méthode')}</div>
    <div class="a" style="left:64px;top:96px;width:1072px;font:600 36px/1.15 Inter;letter-spacing:-.02em;color:${C.navy}">${fix(d.title)}</div>
    <div class="a" style="left:64px;right:64px;top:${d.top || 210}px;display:grid;grid-template-columns:repeat(${n},1fr);gap:16px">
      ${d.steps.map((s, i) => `<div style="background:${i === n - 1 ? C.navy : C.paper};border-radius:12px;padding:22px 20px;height:${d.h || 330}px">
        <div class="tab" style="font:600 22px Inter;color:${i === n - 1 ? 'rgba(255,255,255,.7)' : C.mute}">${String(i + 1).padStart(2, '0')}</div>
        <div style="font:600 23px/1.25 Inter;color:${i === n - 1 ? '#fff' : C.navy};margin-top:14px">${fix(s[0])}</div>
        <div style="font:400 17px/1.45 Inter;color:${i === n - 1 ? 'rgba(255,255,255,.82)' : C.text};margin-top:10px">${fix(s[1])}</div></div>`).join('')}</div>
    <div class="a" style="left:64px;right:64px;bottom:34px;font:400 16px Inter;color:${C.mute}">${fix(d.foot || 'Chaque étape fait l’objet d’une trace écrite dans le dossier.')}</div>`); },
  // two-column checklist, portrait
  checklist: (d) => { const t = TH.white; return page('P', t.bg, `${head(t, d.rubric || 'Notre méthode')}
    ${kicker(t, d.kicker || 'Liste de vérification', 210)}${H(t, d.title, 255, 52)}
    <div class="a" style="left:${M}px;right:${M}px;top:${d.top || 460}px;display:grid;grid-template-columns:1fr 1fr;gap:0 40px">
      ${d.groups.map(g => `<div><div style="font:600 30px Inter;color:${C.navy};padding-bottom:14px;border-bottom:3px solid ${C.navy}">${fix(g[0])}</div>
        ${g[1].map(x => `<div style="display:flex;gap:16px;padding:18px 0;border-bottom:2px solid ${C.line}"><div style="width:22px;height:22px;border:2px solid ${C.navy};border-radius:4px;flex:none;margin-top:5px"></div><div style="font:400 24px/1.4 Inter;color:${C.text}">${fix(x)}</div></div>`).join('')}</div>`).join('')}</div>
    ${reserve(t, d.reserve)}${foot(t)}`); },
};

// =====================================================================
// 10 — CORPORATE, PARTENARIATS, ÉCOSYSTÈME (landscape, placeholders for real assets)
// =====================================================================
export const corporate = {
  evenement: (d) => page('L', C.navy, `
    <div class="a" style="left:0;top:0">${hold(560, 627, 'PHOTO DE L’ÉVÉNEMENT<br>À INSÉRER', true)}</div>
    <div class="a" style="left:610px;top:52px">${word(170, '#fff')}</div>
    <div class="a cap" style="left:610px;top:120px;color:rgba(255,255,255,.66);font-size:16px">${fix(d.kicker)}</div>
    <div class="a" style="left:610px;width:530px;top:160px;font:600 36px/1.18 Inter;letter-spacing:-.02em;color:#fff">${fix(d.title)}</div>
    <div class="a" style="left:610px;width:530px;top:${d.metaTop || 330}px">${d.meta.map(([k, v]) => `<div style="display:grid;grid-template-columns:130px 1fr;gap:16px;padding:12px 0;border-top:1px solid rgba(255,255,255,.22)"><div class="cap" style="font-size:14px;color:rgba(255,255,255,.6);line-height:1.6">${k}</div><div style="font:500 19px Inter;color:#fff">${fix(v)}</div></div>`).join('')}</div>`),
  partenariat: (d) => page('L', '#fff', `
    <div class="a" style="left:64px;top:52px">${word(180, C.navy)}</div>
    <div class="a cap" style="right:64px;top:50px;color:${C.mute};font-size:16px">${fix(d.kicker || 'Collaboration')}</div>
    <div class="a" style="left:64px;right:64px;top:120px;display:flex;align-items:center;justify-content:center;gap:40px">
      <div style="width:300px;height:150px;border:2px solid ${C.line};border-radius:12px;display:flex;align-items:center;justify-content:center">${word(230, C.navy)}</div>
      <div style="font:300 46px Inter;color:${C.mute}">×</div>
      ${hold(300, 150, 'LOGO OFFICIEL<br>DU PARTENAIRE')}</div>
    <div class="a" style="left:120px;right:120px;top:310px;text-align:center;font:600 32px/1.2 Inter;letter-spacing:-.02em;color:${C.navy}">${fix(d.title)}</div>
    <div class="a" style="left:160px;right:160px;top:${d.bodyTop || 400}px;text-align:center;font:400 20px/1.5 Inter;color:${C.text}">${fix(d.body)}</div>`),
  actualite: (d) => page('L', C.paper, `
    <div class="a" style="left:64px;top:52px">${word(180, C.navy)}</div>
    <div class="a cap" style="right:64px;top:50px;color:${C.mute};font-size:16px">${fix(d.kicker || 'Actualité du cabinet')}</div>
    <div class="a" style="left:64px;width:600px;top:130px;font:600 40px/1.15 Inter;letter-spacing:-.02em;color:${C.navy}">${fix(d.title)}</div>
    <div class="a" style="left:64px;width:580px;top:${d.bodyTop || 290}px;font:400 20px/1.5 Inter;color:${C.text}">${fix(d.body)}</div>
    <div class="a" style="right:64px;top:120px">${hold(440, 440, 'PHOTO RÉELLE<br>DU CABINET OU DE L’ÉQUIPE')}</div>`),
};
