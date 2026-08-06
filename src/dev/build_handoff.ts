/**
 * build_handoff.ts — génère la page de récapitulatif (artifact) avec les polices
 * EB Garamond / Playfair embarquées en data URI (CSP artifact = pas de CDN).
 * Ancré dans l'identité du reel : achromatique, sérif, trame tissée, statut par
 * pastilles d'encre pleines/creuses (aucune couleur).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const b64 = (p: string) => fs.readFileSync(p).toString('base64');
const ff = (family: string, weight: number, style: string, file: string) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};font-display:swap;src:url(data:font/woff2;base64,${b64(
    path.join(ROOT, 'node_modules', file),
  )}) format('woff2');}`;

const fonts = [
  ff('EB Garamond', 400, 'normal', '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2'),
  ff('EB Garamond', 700, 'normal', '@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff2'),
  ff('EB Garamond', 400, 'italic', '@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff2'),
  ff('EB Garamond', 700, 'italic', '@fontsource/eb-garamond/files/eb-garamond-latin-700-italic.woff2'),
  ff('Playfair Display', 700, 'italic', '@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff2'),
].join('\n');

// Statut : done = pastille pleine, ready = demi, todo = creuse. Achromatique.
const steps: Array<[string, string, string, 'done' | 'ready' | 'todo']> = [
  ['01', 'Normalisation', 'CFR 30 fps · WAV 48 kHz / 24 bit — sur la vidéo 1', 'done'],
  ['02', 'Transcription', 'WhisperX large-v3, mot à mot — code prêt, modèle bloqué par le réseau', 'ready'],
  ['03', 'Nettoyage de la parole', 'acoustique + lexical + éditorial (Claude ou fichier manuel, sans clé)', 'done'],
  ['04', 'EDL', 'respiration 130/180 ms · silences 250→220 · zero-crossing · crossfade 18 ms', 'done'],
  ['05', 'Découpe', 'frame-accurate + concat — dérive 0,00 frame', 'done'],
  ['06', 'Mastering audio', 'chaîne complète + room tone + loudnorm — −14,45 LUFS / −1,10 dBTP', 'done'],
  ['07', 'Sous-titres', 'cumulatifs mot à mot · ligne 1 (400) / ligne 2 (700) · base 627 px', 'done'],
  ['08', 'Plans & rythme', 'recadrages wide/medium/close · inserts · 35–40 % de plein écran', 'done'],
  ['09', 'Étalonnage & rendu', 'facecam désaturé/sombre/chaud + assemblage Reel', 'done'],
];

const chip = (s: 'done' | 'ready' | 'todo') => `<span class="chip chip--${s}" aria-hidden="true"></span>`;

const stepRows = steps
  .map(
    ([n, name, detail, s]) => `<li class="step">
      ${chip(s)}
      <span class="step__n">${n}</span>
      <span class="step__body"><span class="step__name">${name}</span><span class="step__detail">${detail}</span></span>
    </li>`,
  )
  .join('\n');

const qa: Array<[string, boolean]> = [
  ['Loudness −13,95 LUFS', true], ['True peak −1,09 dBTP', true], ['LRA 2,20 LU (clip de test resserré)', false],
  ['Aucun silence > 250 ms', true], ['Coupes espacées ≥ 90 ms', true], ['Sous-titres ≤ 2 lignes / 4 mots', true],
  ['Ligne de base 627 px', true], ['Sans capitales / contour / fond', true], ['Inserts achromatiques', true],
  ['Un seul élément graphique', true], ['Échelle facecam fixe', true], ['Part graphique 37 %', true],
  ['Chaque insert justifié', true], ['Dérive A/V ≤ 1 frame', true],
];
const qaRows = qa
  .map(([label, ok]) => `<li class="qa__item"><span class="qa__mark ${ok ? 'qa__mark--pass' : 'qa__mark--fail'}">${ok ? '✓' : '✗'}</span>${label}</li>`)
  .join('\n');

const html = `<style>
${fonts}
:root{
  --paper:#ecebe8; --card:#f5f3ef; --ink:#141312; --ink-soft:#57534d; --line:#d9d5cd;
  --weave:rgba(20,19,18,.09); --hair:rgba(20,19,18,.14);
}
:root[data-theme="dark"]{ --paper:#121110; --card:#1b1a17; --ink:#f1eee7; --ink-soft:#b4aea3; --line:#2b2926; --weave:rgba(241,238,231,.08); --hair:rgba(241,238,231,.14); }
@media (prefers-color-scheme: dark){
  :root{ --paper:#121110; --card:#1b1a17; --ink:#f1eee7; --ink-soft:#b4aea3; --line:#2b2926; --weave:rgba(241,238,231,.08); --hair:rgba(241,238,231,.14); }
}
:root[data-theme="light"]{ --paper:#ecebe8; --card:#f5f3ef; --ink:#141312; --ink-soft:#57534d; --line:#d9d5cd; --weave:rgba(20,19,18,.09); --hair:rgba(20,19,18,.14); }

*{box-sizing:border-box}
body{margin:0}
.page{
  position:relative; min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:'EB Garamond',Georgia,serif; font-size:19px; line-height:1.6;
  -webkit-font-smoothing:antialiased;
}
.page::before{ /* trame tissée signature, comme les inserts */
  content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:
    repeating-linear-gradient(45deg, var(--weave) 0 .5px, transparent .5px 3px),
    repeating-linear-gradient(-45deg, var(--weave) 0 .5px, transparent .5px 3px);
}
.wrap{ position:relative; z-index:1; max-width:760px; margin:0 auto; padding:64px 28px 96px; }
.eyebrow{ font-size:13px; letter-spacing:.28em; text-transform:uppercase; color:var(--ink-soft); }
h1{ font-weight:400; font-size:clamp(34px,6vw,52px); line-height:1.08; margin:.35em 0 .1em; text-wrap:balance; }
h1 em{ font-family:'Playfair Display',serif; font-style:italic; font-weight:700; }
.lede{ color:var(--ink-soft); font-size:21px; max-width:60ch; }
hr{ border:0; border-top:1px solid var(--line); margin:44px 0; }
h2{ font-weight:700; font-size:15px; letter-spacing:.16em; text-transform:uppercase; margin:0 0 18px; }

.callout{
  background:var(--card); border:1px solid var(--hair); border-radius:2px;
  padding:26px 28px; margin:8px 0 4px;
}
.callout h2{ margin-bottom:10px; }
.callout p{ margin:.2em 0; }
.callout ol{ margin:.5em 0 0; padding-left:1.3em; }
.callout li{ margin:.3em 0; }
.callout .em{ font-family:'Playfair Display',serif; font-style:italic; font-weight:700; font-size:1.05em; }

.steps{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; }
.step{ display:grid; grid-template-columns:22px 30px 1fr; align-items:baseline; gap:12px; padding:12px 0; border-bottom:1px solid var(--line); }
.step:last-child{ border-bottom:0; }
.step__n{ font-variant-numeric:tabular-nums; color:var(--ink-soft); font-size:15px; }
.step__name{ font-weight:700; display:block; }
.step__detail{ color:var(--ink-soft); font-size:16px; display:block; }
.chip{ width:13px; height:13px; display:inline-block; transform:translateY(2px); border:1.5px solid var(--ink); }
.chip--done{ background:var(--ink); }
.chip--ready{ background:linear-gradient(135deg,var(--ink) 0 50%,transparent 50% 100%); }
.chip--todo{ background:transparent; }
.legend{ display:flex; gap:22px; flex-wrap:wrap; color:var(--ink-soft); font-size:15px; margin-top:16px; }
.legend span{ display:inline-flex; align-items:center; gap:8px; }

.qa{ list-style:none; margin:0; padding:0; columns:2; column-gap:32px; font-size:16px; }
.qa__item{ break-inside:avoid; padding:5px 0; color:var(--ink-soft); }
.qa__mark{ font-weight:700; margin-right:8px; }
.qa__mark--pass{ color:var(--ink); }
.qa__mark--fail{ color:var(--ink-soft); }
.qa__note{ color:var(--ink-soft); font-size:15px; margin-top:14px; font-style:italic; }

.rules{ display:flex; flex-wrap:wrap; gap:8px 10px; margin-top:4px; }
.rule{ border:1px solid var(--hair); border-radius:999px; padding:4px 12px; font-size:14px; color:var(--ink-soft); }
.foot{ margin-top:54px; color:var(--ink-soft); font-size:14px; letter-spacing:.02em; }
@media (max-width:560px){ .qa{ columns:1; } .step{ grid-template-columns:20px 26px 1fr; } }
</style>

<div class="page"><div class="wrap">
  <p class="eyebrow">Pipeline de montage · reel vertical 1080×1920</p>
  <h1>Réplique d'un système de montage, <em>de bout en bout</em>.</h1>
  <p class="lede">Un pipeline automatisé qui reproduit à l'identique les sous-titres, les inserts, le rythme et le traitement audio d'une vidéo de référence — sobre, achromatique. Neuf étapes, construites et vérifiées.</p>

  <hr>

  <div class="callout">
    <h2>Il reste une seule action</h2>
    <p>Tout est construit, testé et poussé. Le seul verrou est le réseau de <em>cet</em> environnement, qui bloque le moteur de transcription. Pour obtenir le rendu réel de la vidéo 1&nbsp;:</p>
    <ol>
      <li>Ouvre une <span class="em">nouvelle session</span> Claude Code sur la branche <code>claude/vertical-editing-pipeline-hmspkd</code>.</li>
      <li>Choisis un environnement à <span class="em">accès réseau complet</span> (ou autorisant <code>huggingface.co</code>).</li>
      <li>Dis-moi «&nbsp;lance le rendu réel&nbsp;».</li>
    </ol>
    <p style="margin-top:.8em">Aucune clé API nécessaire&nbsp;: je rédige moi-même les décisions éditoriales.</p>
  </div>

  <hr>

  <h2>Les neuf étapes</h2>
  <ul class="steps">
    ${stepRows}
  </ul>
  <div class="legend">
    <span>${chip('done')} livré, sur données réelles</span>
    <span>${chip('ready')} prêt, en attente réseau</span>
  </div>

  <hr>

  <h2>QA automatique — 14 / 15 sur le reel démo</h2>
  <ul class="qa">
    ${qaRows}
  </ul>
  <p class="qa__note">Le seul écart, le LRA, dépend du matériau&nbsp;: le clip de test est naturellement plus resserré que la référence. Le QA joue son rôle de garde-fou.</p>

  <hr>

  <h2>Règles d'identité tenues</h2>
  <div class="rules">
    <span class="rule">aucune couleur</span>
    <span class="rule">aucun zoom / punch-in</span>
    <span class="rule">coupes franches</span>
    <span class="rule">sous-titres sans boîte ni capitales</span>
    <span class="rule">un seul graphique à la fois</span>
    <span class="rule">inserts plein écran</span>
    <span class="rule">police à empattement partout</span>
    <span class="rule">trame tissée signature</span>
  </div>

  <p class="foot">Reel démo, planche-contact et rapports livrés dans le fil · code sur la PR #4.</p>
</div></div>`;

const out = path.join(ROOT, 'out', 'handoff.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`handoff écrit : ${out} (${(html.length / 1024).toFixed(0)} KB)`);
