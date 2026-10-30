/* ============================================================
   FYNOVATES — Export : rend tous les carrousels et les empaquette
   dans une seule archive ZIP telechargeable.

   Usage : node src/pack.js            (tous les carrousels finis)
           node src/pack.js societe    (un seul)

   Tous : export/fynovates-carrousels.zip
     instagram-1080x1350/<deck>/<deck>-01.png   -> a poster tel quel
     haute-def-2160x2700/<deck>/<deck>-01.png   -> print, slides, reprise
   Un seul : export/carrousel-<deck>.zip, a plat, les PNG 1080x1350
     prets a poster et rien d'autre (--2x pour la haute def a la place)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EXPORT = path.join(ROOT, 'export');
let STAGE;                               // defini une fois le ou les decks connus

// Carrousels termines et valides. (vatican : encore en cours de validation,
// fisc-b : variante de couverture non retenue — volontairement hors archive.)
const DECKS = [
  { key: null,       name: 'salaire',  titre: 'Personne ne devient riche avec un salaire' },
  { key: 'euro',     name: 'euro',     titre: 'Le vrai ticket de caisse de ton business' },
  { key: 'surcote',  name: 'surcote',  titre: 'Les 5 destinations les plus surcotees pour s\'expatrier en 2026' },
  { key: 'fisc',     name: 'fisc',     titre: 'Les signaux qui font de toi une priorite du fisc' },
  { key: 'holding',  name: 'holding',  titre: 'La holding francaise' },
  { key: 'dm',       name: 'dm',       titre: 'Pose ta question a un tax advisor' },
  { key: 'societe',  name: 'societe',  titre: 'Je peux payer quoi avec ma societe ?' },
  { key: 'hongkong', name: 'hongkong', titre: 'Pourquoi Sami a monte sa societe a Hong Kong' },
];

const TOUTES = [
  { scale: 1, dir: 'instagram-1080x1350', src: 'output' },
  { scale: 2, dir: 'haute-def-2160x2700', src: 'output-2x' },
];

const pad2 = n => String(n).padStart(2, '0');

const argv = process.argv.slice(2);
const HD = argv.includes('--2x');                        // un seul carrousel, en 2160x2700
const only = argv.filter(a => a !== '--2x');
const decks = only.length ? DECKS.filter(d => only.includes(d.name)) : DECKS;
if (!decks.length) { console.error(`Carrousel inconnu : ${only.join(', ')}`); process.exit(1); }

// un seul carrousel demande : archive a plat, une seule resolution
const SEUL = only.length === 1 ? decks[0] : null;
const SCALES = SEUL ? [TOUTES[HD ? 1 : 0]] : TOUTES;
const NOM = SEUL ? `carrousel-${SEUL.name}${HD ? '-2160x2700' : ''}` : 'fynovates-carrousels';
STAGE = path.join(EXPORT, NOM);

// 0. un carrousel dont une image source manque ne peut plus etre re-rendu :
//    il sortirait avec un placeholder. On garde alors les PNG 1080x1350 deja
//    rendus (ils contiennent l'image), et on renonce au 2x pour lui seul.
for (const d of decks) {
  const src = fs.readFileSync(path.join(__dirname, d.key ? `slides-${d.key}.js` : 'slides.js'), 'utf-8');
  const refs = [...src.matchAll(/assets\/[A-Za-z0-9_\-./${}]+?\.(?:png|jpg|jpeg)/g)].map(m => m[0]);
  d.absents = [...new Set(refs)]
    .filter(r => !r.includes('$'))                       // chemins construits : verifies au rendu
    .filter(r => !fs.existsSync(path.join(ROOT, r)));
  d.fige = d.absents.length > 0;
  if (!d.fige) continue;
  // les PNG figes doivent etre au complet, sinon le carrousel sort de l'archive
  const attendu = require(d.key ? `./slides-${d.key}.js` : './slides.js').slides.length;
  const dir = path.join(ROOT, 'output', d.key || '');
  const dispo = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => /^slide-\d+\.png$/.test(f)).length : 0;
  d.utilisable = dispo === attendu;
  console.log(`${d.name.padEnd(9)} image source absente : ${d.absents.join(', ')}`);
  console.log(`          ${d.utilisable
    ? `PNG 1080x1350 deja rendus conserves (${dispo}/${attendu}), pas de 2x`
    : `PNG incomplets (${dispo}/${attendu}) : carrousel ecarte`}`);
}
const retenus = decks.filter(d => !d.fige || d.utilisable);
if (!retenus.length) { console.error('Aucun carrousel livrable : archive non produite.'); process.exit(1); }

// 1. rendu de chaque carrousel dans chaque resolution
let fail = 0;
for (const d of retenus) {
  if (d.fige) continue;                                  // surtout ne pas re-rendre : on perdrait l'image
  for (const s of SCALES) {
    const args = ['src/render.js'];
    if (d.key) args.push('--deck', d.key);
    if (s.scale > 1) args.push('--scale', String(s.scale));
    const out = execFileSync('node', args, { cwd: ROOT, encoding: 'utf-8' });
    const ko = out.includes('A CORRIGER');
    if (ko) { fail++; console.log(out); }
    const n = out.match(/slide-\d+\.png/g)?.length || 0;
    console.log(`${d.name.padEnd(9)} ${String(s.scale) + 'x'}  ${n} slides  ${ko ? 'A CORRIGER' : 'OK'}`);
  }
}
if (fail) { console.error(`\n${fail} rendu(s) non conforme(s) : archive non produite.`); process.exit(1); }

// 2. mise en forme de l'arborescence livree
fs.rmSync(STAGE, { recursive: true, force: true });
let total = 0;
for (const d of retenus) {
  for (const s of SCALES) {
    if (d.fige && s.scale > 1) continue;                 // pas de haute def sans l'image source
    const from = path.join(ROOT, s.src, d.key || '');
    const to = SEUL ? STAGE : path.join(STAGE, s.dir, d.name);
    fs.mkdirSync(to, { recursive: true });
    const pngs = fs.readdirSync(from).filter(f => /^slide-\d+\.png$/.test(f)).sort();
    pngs.forEach(f => {
      const n = Number(f.match(/\d+/)[0]);
      fs.copyFileSync(path.join(from, f), path.join(to, `${d.name}-${pad2(n)}.png`));
      total++;
    });
  }
}

// 3. note de lecture dans l'archive
if (SEUL) {
  const n = fs.readdirSync(STAGE).filter(f => f.endsWith('.png')).length;
  fs.writeFileSync(path.join(STAGE, 'LISEZ-MOI.txt'),
`FYNOVATES — ${SEUL.titre}
${new Date().toISOString().slice(0, 10)}

${n} slides, PNG ${HD ? '2160x2700' : '1080x1350'}${HD ? '' : ' — la taille native du feed Instagram'}.
Numerotees dans l'ordre de publication : une selection groupee dans
Instagram les importe deja dans le bon ordre.

PNG = compression sans perte. Le texte est vectoriel, rendu directement
a cette taille : c'est la qualite maximale possible${HD ? '.' : ' pour un post.'}
`, 'utf-8');
} else {
const lignes = retenus.map(d => {
  const n = fs.readdirSync(path.join(STAGE, SCALES[0].dir, d.name)).length;
  return `  ${d.name.padEnd(9)} ${String(n).padStart(2)} slides   ${d.titre}${d.fige ? '  (*)' : ''}`;
});
const figes = retenus.filter(d => d.fige);
const noteFiges = figes.length ? `
(*) ${figes.map(d => d.name).join(' et ')} : l'image source de ces carrousels
    n'est plus dans le depot. Les PNG 1080x1350 livres sont ceux rendus a
    l'epoque, complets et intacts ; ils n'existent pas en 2160x2700.
` : '';
fs.writeFileSync(path.join(STAGE, 'LISEZ-MOI.txt'),
`FYNOVATES — CARROUSELS INSTAGRAM
${new Date().toISOString().slice(0, 10)}

CARROUSELS
${lignes.join('\n')}

DEUX DOSSIERS, MEMES IMAGES
  instagram-1080x1350/  PNG a la taille native du feed Instagram.
                        C'est CE dossier qu'on poste : aucune mise a
                        l'echelle avant la compression d'Instagram.
  haute-def-2160x2700/  Les memes slides rendues au double. Pour le
                        print, une presentation, un site, une reprise.
                        Inutile pour un post Instagram. Tout le texte y est
                        deux fois plus fin (il est vectoriel, re-rendu a la
                        taille) ; quelques photos et l'avion du carrousel
                        "surcote" sont limites par leur fichier source et
                        n'y gagnent pas de detail.
${noteFiges}
Les fichiers sont nommes dans l'ordre de publication
(<carrousel>-01.png, -02.png, ...) : un import groupe dans Instagram
respecte cet ordre alphabetique.

PNG = compression sans perte : ces fichiers sont la qualite maximale
possible, le texte est du vrai texte vectoriel rendu a la taille finale.
`, 'utf-8');
}

// 4. archive
fs.mkdirSync(EXPORT, { recursive: true });
const zip = path.join(EXPORT, `${NOM}.zip`);
fs.rmSync(zip, { force: true });
execFileSync('zip', ['-r', '-q', '-9', zip, NOM], { cwd: EXPORT });

const mo = (fs.statSync(zip).size / 1048576).toFixed(1);
console.log(`\n${total} PNG dans ${path.relative(ROOT, zip)}  (${mo} Mo)`);
