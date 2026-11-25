// STORIES 1080 × 1920 au rendu de l'éditeur natif d'Instagram (pas de gabarit de designer).
// Approximations des polices natives (propriétaires) : sérif « Classique » → Liberation Serif ; sans-sérif natif → Liberation Sans.
// À la mise en ligne, les textes se tapent directement dans Instagram avec ces styles.
import { page, photo, fix } from './core.mjs';
const f = fix;
const SERIF = "'Liberation Serif','Times New Roman',serif", SANS = "'Liberation Sans',Arial,sans-serif";
const S = body => page(1080, 1920, body);

// Style 1 : sérif noir sur bandeau blanc, un bloc par phrase
const band = (t, top, { size = 50, align = 'center' } = {}) => `<div class="abs" style="left:70px;right:70px;top:${top}px;text-align:${align}"><span style="font:400 ${size}px/1.42 ${SERIF};color:#000;background:#fff;padding:4px 16px;-webkit-box-decoration-break:clone;box-decoration-break:clone">${f(t)}</span></div>`;
// Style 2 : sans-sérif natif, blanc (ombre), sur fond sombre arrondi, ou noir sur photo claire
const sans = (t, top, { size = 48, bold = true, mode = 'ombre', align = 'center' } = {}) => {
  const st = mode === 'fond' ? 'background:rgba(0,0,0,.62);color:#fff;padding:6px 16px;border-radius:12px;' : mode === 'noir' ? 'color:#000;' : 'color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.6);';
  return `<div class="abs" style="left:80px;right:80px;top:${top}px;text-align:${align}"><span style="font:${bold ? 700 : 400} ${size}px/1.36 ${SANS};${st}-webkit-box-decoration-break:clone;box-decoration-break:clone">${f(t)}</span></div>`; };
const subs = (t, top = 1300) => `<div class="abs" style="left:110px;right:110px;top:${top}px;text-align:center"><span style="font:700 46px/1.45 ${SANS};color:#fff;background:rgba(0,0,0,.55);padding:4px 14px;border-radius:10px;-webkit-box-decoration-break:clone;box-decoration-break:clone">${f(t)}</span></div>`;
// Stickers natifs simulés (aperçu) ; la version de production garde l'emplacement libre
const STK = {
  question: (q, top) => `<div class="abs" style="left:180px;right:180px;top:${top}px;border-radius:30px;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.25);padding:0 30px 34px"><div style="width:84px;height:84px;border-radius:50%;margin:-42px auto 14px;border:5px solid #fff;overflow:hidden;position:relative">${photo('portrait-studio', 84, 84, .52, .27, 2.6)}</div><div style="font:700 34px/1.3 ${SANS};color:#262626;text-align:center">${f(q)}</div><div style="margin-top:22px;background:#EFEFEF;border-radius:16px;padding:24px;text-align:center;font:400 30px ${SANS};color:#8e8e8e">Saisissez quelque chose…</div></div>`,
  sondage: (d, top) => `<div class="abs" style="left:170px;right:170px;top:${top}px;background:#fff;border-radius:30px;padding:34px;box-shadow:0 8px 30px rgba(0,0,0,.25)"><div style="font:700 34px/1.3 ${SANS};color:#262626;text-align:center">${f(d[0])}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px">${d.slice(1).map(o => `<div style="background:#F2F2F2;border-radius:18px;padding:26px 10px;text-align:center;font:700 32px ${SANS};color:#262626">${f(o)}</div>`).join('')}</div></div>`,
  quiz: (d, top) => `<div class="abs" style="left:150px;right:150px;top:${top}px;background:#fff;border-radius:30px;padding:30px;box-shadow:0 8px 30px rgba(0,0,0,.25)"><div style="font:700 34px/1.3 ${SANS};color:#262626;text-align:center">${f(d[0])}</div>${d.slice(1).map((o, i) => `<div style="margin-top:16px;border:2px solid #E6E6E6;border-radius:40px;padding:16px 22px;font:500 30px ${SANS};color:#262626"><b style="display:inline-block;width:44px;height:44px;border-radius:50%;border:2px solid #ccc;text-align:center;line-height:40px;font-size:24px;margin-right:14px">${'ABC'[i]}</b>${f(o)}</div>`).join('')}</div>`,
  lien: (d, top) => `<div class="abs" style="left:0;right:0;top:${top}px;text-align:center"><span style="display:inline-block;background:#fff;border-radius:18px;padding:22px 34px;font:700 34px ${SANS};color:#2D6CDF;box-shadow:0 8px 30px rgba(0,0,0,.2)">&#8599;&nbsp; ${f(d)}</span></div>`,
};
const zoneLibre = (top, h) => `<div class="abs" style="left:170px;right:170px;top:${top}px;height:${h}px;border:3px dashed rgba(255,255,255,.75);border-radius:30px;display:flex;align-items:center;justify-content:center;font:700 26px ${SANS};color:rgba(255,255,255,.9);text-transform:uppercase;letter-spacing:.12em;text-shadow:0 1px 6px rgba(0,0,0,.5)">Sticker natif</div>`;
const fonce = (a = .25) => `<div class="abs" style="inset:0;background:rgba(0,0,0,${a})"></div>`;

const EX = {
  standards: ['MES STANDARDS NE SONT PAS NÉGOCIABLES.', 'Je crois à la rigueur, mais pas à la rigidité.', 'À l’ambition, mais pas aux raccourcis.', 'À la liberté, mais pas à l’improvisation.', 'À la croissance, mais pas au détriment de la qualité.'],
  experience: ['AVEC LES ANNÉES, J’AI COMPRIS UNE CHOSE.', 'Une bonne décision ne se prend pas uniquement en regardant son avantage immédiat.', 'Il faut aussi regarder ses conséquences.', 'Et surtout, se demander si elle restera cohérente dans le temps.'],
  vision: ['MA VISION DE L’ENTREPRENEURIAT.', 'Construire une entreprise qui fonctionne.', 'Comprendre ce que l’on crée.', 'S’entourer des bonnes compétences.', 'Ne pas sacrifier le long terme pour un avantage immédiat.'],
};
const bands = (lines, tops) => lines.map((l, i) => band(l, tops[i], { size: i ? 48 : 46 })).join('');
const STORY = (id, famille, nom, html, extra = {}) => ({ id, famille, nom, html, ...extra });
// Mention discrète pour une photo manquante (jamais de scène inventée)
const manque = t => `<div class="abs" style="inset:0;background:#E9E4DC"></div><div class="abs" style="left:90px;right:90px;top:640px;height:640px;border:3px dashed #B9AFA3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:50px"><div style="font:700 26px ${SANS};letter-spacing:.14em;color:#8C847B">PHOTO À FOURNIR</div><div style="margin-top:20px;font:400 40px/1.3 ${SANS};color:#5F574F">${f(t)}</div></div>`;

export const FAMILLES = [
  ['1-photos-de-tiziana', 'Photos de Tiziana + textes'], ['2-paysages-lifestyle', 'Paysages et lifestyle + textes'], ['3-editoriales-convictions', 'Stories éditoriales · convictions'],
  ['4-face-camera', 'Face caméra'], ['5-coulisses-de-dirigeante', 'Coulisses de dirigeante'], ['6-interactives', 'Stories interactives'],
];
export const STORIES = [
  // 1 · Photos de Tiziana + textes (trois compositions : bas, haut et bas, fond sombre en haut)
  STORY('1a-decision', 1, 'Portrait · texte court en bas', () => S(`${photo('portrait-studio', 1080, 1920, .52, .32, 1.25)}${sans('Une décision que je ne prends plus à la légère.', 1380, { size: 56 })}`)),
  STORY('1b-liberte-geographique', 1, 'En extérieur · texte en haut et en bas', () => S(`${photo('jardin-voyage', 1080, 1920, .48, .50, 1.0)}${fonce(.18)}${sans('On parle beaucoup de liberté géographique.', 300, { size: 56 })}${sans('Mais pouvoir travailler depuis différents pays demande aussi de savoir organiser son activité correctement.', 1280, { size: 44, bold: false })}`)),
  STORY('1c-experience', 1, 'Portrait serré · fond sombre', () => S(`${photo('bureau-debout', 1080, 1920, .44, .22, 1.5)}${sans('Ce que l’expérience change dans notre manière de voir les choses.', 1420, { size: 50, mode: 'fond' })}`)),
  // 2 · Paysages et lifestyle + textes (sérif sur ville, sans-sérif blanc sur ville, noir sur ciel, bandeaux sur intérieur)
  STORY('2a-londres', 2, 'Ville · bandeau sérif', () => S(`${photo('illustration-ville-londres', 1080, 1920, .5, .5, 1.0)}${band('Les environnements changent.', 360, { size: 54 })}${band('Les exigences d’une entreprise bien structurée restent les mêmes.', 480, { size: 48 })}`), { illustration: true }),
  STORY('2b-new-york', 2, 'Ville · texte blanc', () => S(`${photo('illustration-new-york', 1080, 1920, .5, .5, 1.0)}${fonce(.15)}${sans('Chaque ville a sa manière d’entreprendre.', 330, { size: 54 })}${sans('La rigueur, elle, voyage avec nous.', 1400, { size: 50, bold: false })}`), { illustration: true }),
  STORY('2c-tours', 2, 'Architecture · texte noir', () => S(`${photo('illustration-tours-jumelles', 1080, 1920, .5, .5, 1.0)}${sans('Ce qui dure se construit lentement.', 360, { size: 60, mode: 'noir' })}${sans('Dans une entreprise comme ailleurs, les fondations comptent plus que la façade.', 520, { size: 42, bold: false, mode: 'noir' })}`), { illustration: true }),
  STORY('2d-palmiers', 2, 'Déplacement · texte court', () => S(`${photo('jardin-voyage', 1080, 1920, .86, .30, 1.9)}${sans('Prendre du recul fait aussi partie du travail.', 1300, { size: 56 })}`)),
  // 3 · Éditoriales : sérif native sur bandeaux blancs (trois mises en page différentes)
  STORY('3a-standards', 3, 'Standards · titre en haut, phrases en bas', () => S(`${photo('portrait-studio', 1080, 1920, .52, .40, 1.0)}${bands(EX.standards, [300, 900, 1090, 1280, 1470])}`)),
  STORY('3b-experience', 3, 'Expérience · bloc aligné à gauche', () => S(`${photo('bureau-debout', 1080, 1920, .46, .42, 1.0)}${EX.experience.map((l, i) => band(l, [980, 1110, 1330, 1450][i], { size: i ? 44 : 46, align: 'left' })).join('')}`)),
  STORY('3c-vision', 3, 'Vision · phrases réparties sur la photo', () => S(`${photo('studio-podcast', 1080, 1920, .46, .42, 1.0)}${band(EX.vision[0], 280, { size: 48 })}${band(EX.vision[1], 760, { size: 46, align: 'left' })}${band(EX.vision[2], 960, { size: 46, align: 'right' })}${band(EX.vision[3], 1160, { size: 46, align: 'left' })}${band(EX.vision[4], 1360, { size: 46, align: 'right' })}`)),
  // 4 · Face caméra (sous-titres natifs ; images tirées des photos en attendant les captures vidéo)
  STORY('4a-erreur', 4, 'Face caméra · bureau', () => S(`${photo('bureau-debout', 1080, 1920, .44, .30, 1.12)}${sans('Une erreur que je rencontre régulièrement…', 290, { size: 44, mode: 'fond' })}${subs('On choisit le pays avant de comprendre son activité.')}`), { capture: true }),
  STORY('4b-annees', 4, 'Face caméra · studio', () => S(`${photo('studio-podcast', 1080, 1920, .46, .32, 1.25)}${subs('Avec les années, j’ai remarqué quelque chose : les plus sereins sont rarement les plus pressés.')}`), { capture: true }),
  STORY('4c-fynovates', 4, 'Face caméra · portrait', () => S(`${photo('portrait-studio', 1080, 1920, .52, .34, 1.15)}${subs('Une chose que j’ai comprise en dirigeant Fynovates : une équipe solide vaut mieux qu’une organisation parfaite sur le papier.', 1220)}`), { capture: true }),
  // 5 · Coulisses de dirigeante
  STORY('5a-organisation', 5, 'Bureau · heure et fond sombre', () => S(`${photo('bureau-rire-documents', 1080, 1920, .45, .40, 1.0)}${sans('Mardi, 9 h 30', 300, { size: 44, align: 'left' })}${sans('Aujourd’hui, je travaille sur un sujet important : faire évoluer notre organisation sans perdre notre niveau d’exigence.', 1240, { size: 44, mode: 'fond' })}`)),
  STORY('5b-tournage', 5, 'Préparation d’une vidéo · bandeau', () => S(`${photo('studio-podcast', 1080, 1920, .46, .46, 1.0)}${band('En préparation d’un nouveau décryptage.', 300, { size: 52 })}`)),
  STORY('5c-demain', 5, 'Détail du bureau · texte blanc', () => S(`${photo('bureau-rire-documents', 1080, 1920, .80, .35, 1.6)}${fonce(.2)}${sans('Une grande partie du travail d’une dirigeante consiste à penser à ce qui permettra à l’entreprise de bien fonctionner demain.', 1150, { size: 48 })}`)),
  STORY('5d-equipe', 5, 'Équipe · photo à fournir', () => S(`${manque('Tiziana avec son équipe ou en réunion')}${sans('Construire une équipe, c’est aussi apprendre à répartir les responsabilités et à faire confiance aux bonnes compétences.', 1340, { size: 40, mode: 'noir', bold: false })}`), { manquante: true }),
  // 6 · Interactives (production : place libre pour le sticker natif ; aperçu : sticker simulé)
  STORY('6a-question', 6, 'Boîte à questions', (ap = false) => S(`${photo('portrait-studio', 1080, 1920, .52, .38, 1.0)}${fonce(.2)}${sans('Pour les entrepreneurs qui me suivent :', 960, { size: 48 })}${ap ? STK.question('Quelle est la difficulté que vous rencontrez le plus souvent lorsque vous développez votre activité à l’international ?', 1130) : ''}`), { sticker: true }),
  STORY('6b-sondage', 6, 'Sondage', (ap = false) => S(`${photo('jardin-voyage', 1080, 1920, .12, .30, 1.9)}${fonce(.15)}${sans('As-tu déjà réfléchi à ton organisation financière personnelle ?', 420, { size: 52 })}${ap ? STK.sondage(['Ton organisation financière', 'Oui', 'Pas encore'], 1050) : ''}`), { sticker: true }),
  STORY('6c-lien-youtube', 6, 'Lien YouTube', (ap = false) => S(`${photo('studio-podcast', 1080, 1920, .46, .40, 1.0)}${sans('Nouvelle vidéo en ligne.', 1060, { size: 56 })}${sans('Pourquoi choisir son pays avant d’analyser son activité est une erreur.', 1170, { size: 42, bold: false })}${ap ? STK.lien('YOUTUBE.COM/@[CHAÎNE]', 1420) : ''}`), { sticker: true }),
  STORY('6d-lien-fynovates', 6, 'Lien vers Fynovates', (ap = false) => S(`${photo('bureau-debout', 1080, 1920, .45, .40, 1.0)}${sans('Pour une situation précise, l’équipe Fynovates peut l’analyser.', 1150, { size: 46, mode: 'fond' })}${ap ? STK.lien('FYNOVATES.COM', 1420) : ''}`), { sticker: true }),
  STORY('6e-quiz', 6, 'Quiz', (ap = false) => S(`${photo('illustration-bureaux', 1080, 1920, .5, .5, 1.0)}${sans('Est-ce que tu considères la construction de ton patrimoine dès aujourd’hui ?', 330, { size: 50, mode: 'fond' })}${ap ? STK.quiz(['Ton patrimoine', 'J’y pense déjà', 'Plus tard', 'Je ne sais pas par où commencer'], 900) : ''}`), { sticker: true, illustration: true }),
];

const scr = (nom, html, extra = {}) => [nom, { html, ...extra }];
export const SEQUENCES = [
  { id: 'a-avec-le-recul', titre: 'Avec le recul…', theme: 'Les enseignements de Tiziana', ecrans: [
    scr('Accroche', () => S(`${photo('portrait-studio', 1080, 1920, .52, .34, 1.15)}${band('AVEC LE RECUL…', 1250, { size: 54 })}${band('il y a une chose que j’aurais aimé comprendre plus tôt.', 1380, { size: 48 })}`)),
    scr('Observation', () => S(`${photo('bureau-rire-documents', 1080, 1920, .45, .40, 1.0)}${sans('Beaucoup d’entrepreneurs cherchent d’abord la structure idéale.', 1050, { size: 48, mode: 'fond' })}${sans('Très peu commencent par regarder comment leur activité fonctionne réellement.', 1300, { size: 42, bold: false, mode: 'fond' })}`)),
    scr('Réflexion', () => S(`${photo('jardin-voyage', 1080, 1920, .9, .30, 1.9)}${sans('Une organisation solide ne se voit pas.', 360, { size: 54 })}${sans('Elle se ressent dans la sérénité avec laquelle on prend ses décisions.', 1300, { size: 46, bold: false })}`)),
    scr('Conviction', () => S(`${photo('bureau-debout', 1080, 1920, .46, .42, 1.0)}${band('On structure ce que l’on comprend.', 1200, { size: 54 })}${band('Jamais l’inverse.', 1320, { size: 54 })}`))] },
  { id: 'b-journal-de-dirigeante', titre: 'Journal de dirigeante', theme: 'Le développement de Fynovates', ecrans: [
    scr('Moment de travail', () => S(`${photo('bureau-rire-documents', 1080, 1920, .45, .40, 1.0)}${sans('Mardi, 9 h 30', 300, { size: 44, align: 'left' })}${sans('Revue de notre organisation interne avec l’équipe.', 1350, { size: 46, mode: 'fond' })}`)),
    scr('Priorité', () => S(`${photo('bureau-debout', 1080, 1920, .44, .32, 1.1)}${band('LA PRIORITÉ DU MOMENT', 1150, { size: 48 })}${band('Faire évoluer notre organisation sans perdre notre niveau d’exigence.', 1270, { size: 48 })}`)),
    scr('Réflexion', () => S(`${photo('studio-podcast', 1080, 1920, .46, .38, 1.1)}${sans('Diriger, c’est souvent arbitrer entre ce qui est urgent et ce qui est important.', 1250, { size: 48 })}`)),
    scr('Enseignement', () => S(`${photo('illustration-tours-verre', 1080, 1920, .55, .5, 1.0)}${band('Ce que j’en retiens :', 820, { size: 50 })}${band('une croissance se prépare avant d’arriver.', 940, { size: 50 })}`), { illustration: true })] },
  { id: 'c-ma-vision-de-l-international', titre: 'Ma vision de l’international', theme: 'La structuration des entrepreneurs', ecrans: [
    scr('Prise de position', () => S(`${photo('portrait-studio', 1080, 1920, .50, .38, 1.05)}${band('Je ne crois pas aux solutions universelles à l’international.', 1250, { size: 54 })}`)),
    scr('Idée reçue', () => S(`${photo('illustration-ville-londres', 1080, 1920, .5, .5, 1.0)}${fonce(.3)}${sans('Une idée reçue :', 600, { size: 44, bold: false })}${sans('« Il suffit de créer une société à l’étranger pour payer moins d’impôts. »', 700, { size: 54 })}`), { illustration: true }),
    scr('Raisonnement', () => S(`${photo('jardin-voyage', 1080, 1920, .48, .46, 1.15)}${sans('Ta résidence, le lieu de ton activité, tes clients, l’endroit où tu décides : tout se tient.', 300, { size: 46, mode: 'fond' })}${sans('Changer un seul élément ne suffit pas.', 1400, { size: 50, mode: 'fond' })}`)),
    scr('Conviction', () => S(`${photo('bureau-debout', 1080, 1920, .46, .42, 1.0)}${band('Une structure se construit à partir de la réalité.', 1150, { size: 50 })}${band('Jamais à partir d’un taux.', 1340, { size: 50 })}`)),
    scr('Redirection YouTube', (ap = false) => S(`${photo('studio-podcast', 1080, 1920, .46, .40, 1.0)}${sans('J’en parle en détail dans ma dernière vidéo.', 1150, { size: 50 })}${ap ? STK.lien('YOUTUBE.COM/@[CHAÎNE]', 1400) : ''}`), { sticker: true })] },
  { id: 'd-une-question-que-l-on-me-pose', titre: 'Une question que l’on me pose souvent', theme: 'Problématique entrepreneuriale', ecrans: [
    scr('Question', () => S(`${photo('illustration-new-york', 1080, 1920, .5, .5, 1.0)}${fonce(.35)}${sans('Une question que l’on me pose souvent :', 640, { size: 44, bold: false })}${sans('« Dans quel pays dois-je créer ma société ? »', 760, { size: 60 })}`), { illustration: true }),
    scr('Réponse', () => S(`${photo('portrait-studio', 1080, 1920, .52, .36, 1.1)}${band('Ma réponse : cela dépend de ta situation.', 1200, { size: 50 })}${band('La tienne, pas celle de quelqu’un d’autre.', 1390, { size: 50 })}`)),
    scr('Mise en perspective', () => S(`${photo('bureau-rire-documents', 1080, 1920, .5, .42, 1.0)}${sans('Où vis-tu ? Où travailles-tu ? Où sont tes clients ? Qui prend les décisions ?', 1000, { size: 46, mode: 'fond' })}${sans('Ces réponses comptent plus que le pays lui-même.', 1330, { size: 46, mode: 'fond' })}`)),
    scr('Redirection', (ap = false) => S(`${photo('bureau-debout', 1080, 1920, .45, .36, 1.05)}${sans('L’analyse complète est sur ma chaîne YouTube.', 1120, { size: 48 })}${ap ? STK.lien('YOUTUBE.COM/@[CHAÎNE]', 1330) : ''}${sans('Pour une situation précise : @fynovates', 1500, { size: 36, bold: false })}`), { sticker: true })] },
];

// ———————————————————— STORIES À LA UNE : deux rubriques uniquement
export const HIGHLIGHTS = [
  { id: 'a-propos-de-moi', nom: 'À PROPOS DE MOI', ph: ['portrait-studio', .52, .27, 3.0], typo: ['À PROPOS', 'DE MOI'], stories: [
    ['Qui je suis', () => S(`${photo('portrait-studio', 1080, 1920, .52, .36, 1.05)}${band('Je suis Tiziana Caci.', 1150, { size: 58 })}${band('Fondatrice & directrice de Fynovates.', 1280, { size: 46 })}${band('Ici, je partage mon expérience, mes réflexions et ma vision de l’entrepreneuriat.', 1400, { size: 46 })}`)],
    ['Mon parcours', () => S(`${photo('jardin-voyage', 1080, 1920, .48, .50, 1.0)}${fonce(.2)}${sans('Mon parcours', 300, { size: 56 })}${sans('[Étapes réelles du parcours de Tiziana, à rédiger avec elle : formation, expériences, création de Fynovates.]', 1250, { size: 42, bold: false, mode: 'fond' })}`), { aCompleter: true }],
    ['Mon expérience', () => S(`${photo('bureau-debout', 1080, 1920, .46, .42, 1.0)}${EX.experience.map((l, i) => band(l, [980, 1110, 1330, 1450][i], { size: i ? 44 : 46, align: 'left' })).join('')}`)],
    ['Ma vision', () => S(`${photo('studio-podcast', 1080, 1920, .46, .42, 1.0)}${band(EX.vision[0], 280, { size: 48 })}${band(EX.vision[1], 760, { size: 46, align: 'left' })}${band(EX.vision[2], 960, { size: 46, align: 'right' })}${band(EX.vision[3], 1160, { size: 46, align: 'left' })}${band(EX.vision[4], 1360, { size: 46, align: 'right' })}`)],
    ['Mes convictions', () => S(`${photo('portrait-studio', 1080, 1920, .52, .40, 1.0)}${bands(EX.standards, [300, 900, 1090, 1280, 1470])}`)],
    ['Ma personnalité', () => S(`${photo('bureau-rire-documents', 1080, 1920, .45, .40, 1.0)}${sans('Exigeante sur le fond.', 1200, { size: 54 })}${sans('Et toujours capable d’en rire.', 1300, { size: 54, bold: false })}`)],
  ] },
  { id: 'mon-cabinet', nom: 'MON CABINET', ph: ['bureau-rire-documents', .40, .30, 2.2], typo: ['MON', 'CABINET'], stories: [
    ['Fynovates', () => S(`${photo('bureau-debout', 1080, 1920, .44, .32, 1.1)}${band('Fynovates, le cabinet que j’ai fondé et que je dirige.', 1200, { size: 52 })}`)],
    ['Nos domaines d’expertise', () => S(`${photo('illustration-bureaux', 1080, 1920, .5, .5, 1.0)}${fonce(.35)}${sans('Nos domaines d’expertise', 300, { size: 54 })}${['Fiscalité nationale et internationale', 'TVA', 'Comptabilité', 'Structuration juridique et internationale', 'Solutions bancaires professionnelles', 'Résidence fiscale et expatriation'].map((x, i) => sans(x, 760 + i * 120, { size: 42, mode: 'fond' })).join('')}`), { illustration: true }],
    ['Notre accompagnement', () => S(`${photo('studio-podcast', 1080, 1920, .46, .40, 1.0)}${sans('Comment nous accompagnons les entrepreneurs', 1000, { size: 50 })}${sans('Comprendre l’activité réelle. Analyser la situation dans chaque pays. Recommander une organisation cohérente. Accompagner sa mise en place.', 1180, { size: 42, bold: false, mode: 'fond' })}`)],
    ['La construction du cabinet', () => S(`${photo('bureau-rire-documents', 1080, 1920, .45, .40, 1.0)}${sans('Construire le cabinet', 300, { size: 54 })}${sans('Une entreprise ne grandit pas uniquement parce qu’elle a davantage de clients. Elle doit aussi développer une organisation capable de suivre cette croissance.', 1180, { size: 42, mode: 'fond' })}`)],
    ['Notre équipe', () => S(`${manque('L’équipe et les experts de Fynovates')}${sans('Notre équipe et nos experts', 1340, { size: 46, mode: 'noir' })}`), { manquante: true }],
    ['Coulisses et contact', (ap = false) => S(`${photo('bureau-debout', 1080, 1920, .45, .40, 1.0)}${sans('Les coulisses, les projets, l’équipe : tout est ici.', 1100, { size: 46, mode: 'fond' })}${ap ? STK.lien('@FYNOVATES', 1400) : ''}`), { sticker: true }],
  ] },
];
export const hlPhoto = h => page(1080, 1080, photo(h.ph[0], 1080, 1080, h.ph[1], h.ph[2], h.ph[3]));
export const hlTypo = h => page(1080, 1080, `<div class="abs" style="inset:0;background:#F3EDE4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">${h.typo.map(l => `<div style="font:500 120px/1 Jost;letter-spacing:.12em;color:#211B17">${l}</div>`).join('')}</div>`, '', '#F3EDE4');
