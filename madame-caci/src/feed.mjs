// FEED : uniquement des photographies (aucun texte, aucun montage) — 1080 × 1350.
// REELS : images tirées des photos de Tiziana, avec un sous-titre sobre de style natif — 1080 × 1920.
import { page, photo, fix, C } from './core.mjs';
const f = fix;
const P = body => page(1080, 1350, body);
const pic = (k, fx, fy, z = 1) => () => P(photo(k, 1080, 1350, fx, fy, z));
// Emplacement photo manquante : signalé, jamais inventé.
const manque = t => () => P(`<div class="abs" style="inset:0;background:#E9E4DC"></div><div class="abs" style="inset:40px;border:3px dashed #B9AFA3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px">
  <div class="lab" style="font-size:22px;color:#8C847B">Photo à fournir</div><div class="j" style="margin-top:20px;font-size:38px;line-height:1.3;color:#5F574F">${f(t)}</div></div>`, '');

// Ordre de la grille : alternance personne, lieu, travail, détail.
export const FEED = [
  { id: '01-portrait-studio', cat: 'Portrait', html: pic('portrait-studio', .48, .42), legende: 'Construire une entreprise, c’est apprendre à penser au-delà de la prochaine décision.' },
  { id: '02-londres', cat: 'Lieu · ville', html: pic('illustration-ville-londres', .5, .5), legende: 'L’international ouvre des possibilités. Mais il demande aussi une organisation beaucoup plus structurée.', illustration: true },
  { id: '03-au-bureau', cat: 'Moment professionnel', html: pic('bureau-rire-documents', .5, .45), legende: 'Aujourd’hui, beaucoup de réflexions autour de l’organisation et du développement de Fynovates. Et quelques fous rires.' },
  { id: '04-architecture-verre', cat: 'Architecture', html: pic('illustration-tours-verre', .55, .5), legende: 'Les belles structures ont toujours quelque chose en commun : on ne voit pas tout ce qui les fait tenir.', illustration: true },
  { id: '05-jardin', cat: 'Portrait en extérieur', html: pic('jardin-voyage', .5, .52), legende: 'Prendre du recul fait aussi partie du travail.', carrousel: true },
  { id: '06-detail-micro', cat: 'Détail', html: pic('studio-podcast', .78, .40, 2.2), legende: 'Une conviction se travaille avant d’être partagée.' },
  { id: '07-debout-bureau', cat: 'Portrait · environnement professionnel', html: pic('bureau-debout', .48, .45), legende: 'La croissance est intéressante. La capacité à l’absorber correctement l’est encore plus.' },
  { id: '08-interieur-bureaux', cat: 'Intérieur professionnel', html: pic('illustration-bureaux', .5, .5), legende: 'Un bel espace de travail aide. Une organisation claire aide davantage.', illustration: true },
  { id: '09-prise-de-parole', cat: 'Moment professionnel · prise de parole', html: pic('studio-podcast', .48, .46), legende: 'Préparer une prise de parole, c’est d’abord clarifier ce que l’on pense vraiment.' },
  { id: '10-new-york', cat: 'Lieu · ville', html: pic('illustration-new-york', .5, .5), legende: 'Découvrir de nouveaux environnements entrepreneuriaux permet de prendre du recul sur sa propre manière de construire une entreprise.', illustration: true },
  { id: '11-portrait-serre', cat: 'Portrait', html: pic('portrait-studio', .52, .30, 1.6), legende: 'Une grande partie du travail d’une dirigeante consiste à prendre des décisions que personne ne voit.' },
  { id: '12-palmiers', cat: 'Déplacement · ambiance', html: pic('jardin-voyage', .86, .30, 1.8), legende: 'Ailleurs, les questions restent les mêmes. Seul le regard change.' },
  { id: '13-reunion', cat: 'Moment professionnel', html: manque('Tiziana en réunion avec ses collaborateurs'), legende: '[Légende à rédiger à partir de la situation réelle.]', manquante: true },
  { id: '14-portrait-naturel', cat: 'Portrait naturel', html: pic('bureau-debout', .44, .25, 1.45), legende: 'Diriger, c’est souvent choisir ce que l’on ne fera pas.' },
  { id: '15-tours', cat: 'Architecture', html: pic('illustration-tours-jumelles', .5, .5), legende: 'Ce qui dure se construit lentement.', illustration: true },
];
// Carrousel photographique (aucune page de texte) : publication 05
export const CARROUSEL = [pic('jardin-voyage', .5, .52), pic('jardin-voyage', .86, .30, 1.8), pic('jardin-voyage', .45, .30, 1.6), pic('jardin-voyage', .48, .62, 1.5)];

// ———————————————————— REELS : image de la vidéo + sous-titre natif sobre (pas de couverture graphique)
const reel = (k, fx, fy, z, sub) => () => page(1080, 1920, `${photo(k, 1080, 1920, fx, fy, z)}
  <div class="abs" style="left:90px;right:90px;top:1180px;text-align:center"><span style="font:700 52px/1.32 'Liberation Sans',Arial,sans-serif;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.65),0 0 2px rgba(0,0,0,.8)">${f(sub)}</span></div>`);
export const REELS = [
  { id: '01-face-camera-societes-etrangeres', cat: 'Face caméra', sujet: 'Pourquoi je ne crois pas aux sociétés étrangères comme solutions universelles', html: reel('portrait-studio', .52, .36, 1.12, 'Une société étrangère n’est pas une solution universelle.') },
  { id: '02-terrain-deplacement', cat: 'Reportage et terrain', sujet: 'Une observation pendant un déplacement', html: reel('jardin-voyage', .48, .48, 1.0, 'Ce qu’un déplacement m’apprend à chaque fois…') },
  { id: '03-youtube-pays', cat: 'Extrait YouTube', sujet: 'Pourquoi choisir son pays avant d’analyser son activité est une erreur', html: reel('studio-podcast', .46, .42, 1.0, 'On choisit souvent le pays avant de comprendre l’activité.') },
  { id: '04-storytelling-fynovates', cat: 'Storytelling', sujet: 'Ce que j’ai appris en dirigeant Fynovates', html: reel('bureau-rire-documents', .45, .40, 1.0, 'Ce que j’ai appris en dirigeant Fynovates.') },
  { id: '05-face-camera-dirigeant', cat: 'Face caméra', sujet: 'Une entreprise peut gagner de l’argent sans enrichir réellement son dirigeant', html: reel('bureau-debout', .44, .32, 1.1, 'Ton entreprise peut gagner de l’argent sans que tu t’enrichisses.') },
  { id: '06-youtube-raisonnement', cat: 'Extrait YouTube', sujet: 'Un raisonnement extrait d’un décryptage', html: reel('studio-podcast', .62, .34, 1.4, 'La vraie question n’est pas « où ? », c’est « comment ? ».') },
  { id: '07-face-camera-expatriation', cat: 'Face caméra', sujet: 'Ce que je remarque chez les entrepreneurs qui veulent s’expatrier', html: reel('portrait-studio', .50, .45, 1.0, 'Ce que je remarque chez ceux qui veulent s’expatrier…') },
  { id: '08-storytelling-decision', cat: 'Storytelling', sujet: 'Une décision de dirigeante', html: reel('bureau-debout', .52, .50, 1.0, 'Une décision que je prendrais différemment aujourd’hui.') },
  { id: '09-terrain-evenement', cat: 'Reportage et terrain', sujet: 'En marge d’une intervention', html: reel('studio-podcast', .30, .45, 1.15, 'Juste avant d’enregistrer, une réflexion…') },
  { id: '10-storytelling-temps', cat: 'Storytelling', sujet: 'Une conviction qui a évolué', html: reel('jardin-voyage', .47, .44, 1.35, 'J’ai changé ma manière de considérer mon temps.') },
  { id: '11-youtube-conviction', cat: 'Extrait YouTube', sujet: 'Une prise de position', html: reel('studio-podcast', .46, .30, 1.35, 'Je préfère une structure simple et maîtrisée.') },
  { id: '12-terrain-ville', cat: 'Reportage et terrain', sujet: 'Une réflexion filmée en ville', html: () => page(1080, 1920, `<div class="abs" style="inset:0;background:#E9E4DC"></div><div class="abs" style="inset:60px;border:3px dashed #B9AFA3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px"><div class="lab" style="font-size:24px;color:#8C847B">Vidéo à tourner</div><div class="j" style="margin-top:24px;font-size:44px;line-height:1.3;color:#5F574F">Tiziana parle depuis une ville, lors d’un déplacement</div></div>`, '', '#E9E4DC'), manquante: true },
];
