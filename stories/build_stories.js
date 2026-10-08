// Génère les 12 stories Instagram (1080x1920) du rétroplanning "1er janvier".
// Usage : NODE_PATH=/opt/node-tools/node_modules node stories/build_stories.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const GREEN = '#0E8A3E';
const RED = '#D7263D';

// Chaque story : lignes principales (main), sous-texte (sub), couleur et mot(s) à colorer.
// Les balises <c>…</c> marquent l'unique élément coloré de la story.
const STORIES = [
  {
    main: ['Décembre est le pire mois possible pour penser à ta fiscalité.',
           'Bizarrement, <c>Octobre</c> est le meilleur mois de l’année pour ça.'],
    sub: 'Je t’explique ➡️', color: GREEN, hero: true,
  },
  {
    main: ['La résidence fiscale se joue par année civile.',
           'Partir au <c>1er janvier</c> = une année pleine sous ton nouveau régime.'],
    sub: '0 année coupée en deux.', color: GREEN,
  },
  {
    main: ['Partir en mars ou en juillet ? C’est possible.',
           'Mais c’est plus sale et <c>plus cher</c>.'],
    sub: '1er janvier : déclaration de départ propre, 0 double déclaration bancale.', color: RED,
  },
  {
    label: '❌🎄 LE PROBLÈME DE DÉCEMBRE',
    main: ['Chaque année, c’est pareil.',
           'En décembre, mon agenda se remplit de gens « décidés à partir au 1er janvier ».'],
    sub: 'Sauf que…', color: RED,
  },
  {
    main: ['Une expatriation propre demande 10 à 12 semaines.',
           'Décider en décembre = partir en avril = une année fiscale <c>de perdue</c>.'],
    sub: '20, 30, 40\u00a0000€. Évaporés dans l’hésitation.', color: RED,
  },
  {
    label: '🟢 LE RÉTROPLANNING : <c>OCTOBRE</c> (maintenant)',
    main: ['Semaines 1-2 : l’audit et la décision.',
           'La destination selon TON profil, pas selon Instagram.'],
    sub: 'LA phase qui conditionne tout le reste.', color: GREEN,
  },
  {
    label: '🟢 LE RÉTROPLANNING : <c>NOVEMBRE</c>',
    main: ['Pendant que les autres préparent Noël,', 'toi tu prépares ta liberté.'],
    sub: 'Semaines 3-6 : visa ou permis de résidence, structure, logement, banque.', color: GREEN,
  },
  {
    label: '🟢 LE RÉTROPLANNING : <c>DÉCEMBRE</c>',
    main: ['Semaines 7-10 : la rupture propre.',
           '🔥 Tout est prêt AVANT les fêtes. Tu passes Noël serein.'],
    sub: 'Résiliations, notification au fisc, impots.gouv, derniers virements, cartons.', color: GREEN,
  },
  {
    label: '🟢 LE RÉTROPLANNING : <c>1ER JANVIER</c> ✈️',
    main: ['Pendant que les autres prennent des « bonnes résolutions »…',
           'toi tu as déjà exécuté la tienne.'],
    sub: 'Résidence établie dès le jour 1.', color: GREEN,
  },
  {
    main: ['🔴 L’hésitation a un tarif. Et il est mensuel.',
           '⚠️ À 10k/mois de bénéfice, chaque trimestre de retard = <c>8\u00a0000 à 12\u00a0000€</c>.'],
    sub: 'Décision en décembre = départ au printemps.', color: RED,
  },
  {
    main: ['⚠️ Dans 4 semaines, le rétroplanning devient serré.',
           '🔴 Dans 8 semaines, il devient <c>impossible</c>.'],
    sub: 'Pas « un bon moment ». 🥂 LE moment où ton 1er janvier se décide.', color: RED,
  },
  {
    main: ['🎁 Ton 1er janvier 2027 se construit maintenant.',
           '🎯 Réponds <c>JANVIER</c> à cette story.'],
    sub: '🎁 Je t’offre cet échange : ton audit, étape 1, cette semaine ou la suivante.',
    color: GREEN, box: true,
  },
];

function html(s, idx) {
  const colorStyle = s.box
    ? `.c{color:${s.color};border:6px solid ${s.color};border-radius:18px;padding:0 22px;}`
    : `.c{color:${s.color};}`;
  const span = (t) => t.replace(/<c>/g, '<span class="c">').replace(/<\/c>/g, '</span>');
  const label = s.label ? `<div class="label">${span(s.label)}</div>` : '';
  const mainHtml = s.main.map((l, i) => `<p class="${i === 0 ? 'lead' : 'body'}">${span(l)}</p>`).join('');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>
  html,body{margin:0;width:1080px;height:1920px;background:#fff;}
  body{font-family:"Inter","Noto Color Emoji",sans-serif;color:#111;
       -webkit-font-smoothing:antialiased;}
  .safe{position:absolute;left:0;right:0;top:250px;bottom:300px;
        padding:0 84px;display:flex;flex-direction:column;justify-content:center;gap:34px;}
  .label{font-family:"Inter Display","Inter","Noto Color Emoji",sans-serif;font-weight:700;
         font-size:40px;letter-spacing:0.08em;text-transform:uppercase;line-height:1.3;color:#111;}
  .lead{font-family:"Inter Display","Inter","Noto Color Emoji",sans-serif;font-weight:700;
        font-size:${s.hero ? 92 : 84}px;line-height:1.12;letter-spacing:-0.02em;margin:0;}
  .body{font-weight:500;font-size:62px;line-height:1.22;letter-spacing:-0.01em;margin:0;}
  .sub{font-weight:400;font-size:40px;line-height:1.35;color:#666;margin-top:26px;}
  .sub .c{color:${s.color};}
  ${colorStyle}
  .n{position:absolute;left:84px;bottom:330px;font-size:26px;letter-spacing:0.2em;color:#bbb;font-weight:500;}
</style></head><body>
<div class="safe">${label}${mainHtml}<div class="sub">${span(s.sub)}</div></div>
<div class="n">${String(idx + 1).padStart(2, '0')} / ${STORIES.length}</div>
</body></html>`;
}

(async () => {
  const outDir = path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (let i = 0; i < STORIES.length; i++) {
    await page.setContent(html(STORIES[i], i), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // Vérifie que le bloc tient dans la zone sûre.
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.safe');
      return el.scrollHeight - el.clientHeight;
    });
    if (overflow > 0) console.warn(`Story ${i + 1}: dépasse la zone sûre de ${overflow}px`);
    const file = path.join(outDir, `story-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log('OK', path.basename(file));
  }
  await browser.close();
})();
