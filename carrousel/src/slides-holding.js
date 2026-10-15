/* ============================================================
   FYNOVATES / Madame Caci — Deck « holding »
   « La holding française » — éditorial minimal : noir sur blanc,
   texte toujours centré, photos en bandeaux noir et blanc.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const COVER = Number(process.env.COVER_BAND || 702);   /* hauteur du bandeau de couverture */

const DECOR = '';                     /* aucun décor : c'est la règle du style */

/* bandeau photo : noir et blanc, bords francs ; repli gris si le fichier manque */
const band = (file, keyword, top, height) => {
  const style = `left:0;top:${top}px;width:1080px;height:${height}px`;
  const abs = path.join(__dirname, '..', 'assets', 'holding', file);
  return fs.existsSync(abs)
    ? `<div class="ph bleed" style="${style}"><img src="REL_TOKEN/assets/holding/${file}" alt=""></div>`
    : `<div class="ph-miss bleed" style="${style}">${keyword.toUpperCase()}</div>`;
};

/* une slide = un bandeau éventuel, et le texte centré dans le blanc qui reste */
const slide = ({ n, photo = '', free: [t, b] = [0, 1350], blocks, swipe = false, sign = 19, shift = 0 }) => ({
  main: `
      ${photo}
      <div class="ed-nav" style="top:${t + 88}px">${String(n).padStart(2, '0')} / 10</div>
      <div class="stack" style="top:${Math.round((t + b) / 2) + shift}px">
        ${blocks}
      </div>
      ${swipe ? `<div class="ed-swipe" style="top:${b - 150}px">glisser &rarr;</div>` : ''}
      <div class="ed-sign" style="top:${b - 112 - Math.round((sign - 19) * 1.3)}px;font-size:${sign}px">MADAME CACI</div>`
});

module.exports = { DECOR, slides: [

  /* ================= 01 · COUVERTURE ================= */
  slide({
    n: 1, free: [COVER, 1350], swipe: true, shift: -6,
    photo: band('01-paris.jpg', 'paris rooftops eiffel tower', 0, COVER),
    blocks: `
        <h1 class="h1" style="font-size:${COVER > 760 ? 78 : 92}px">La holding<br>française.</h1>
        <p class="p" style="font-size:26px;margin-top:40px;max-width:880px">L'arme fiscale que les
          riches utilisent sans quitter Paris.</p>`
  }),

  /* ================= 02 · LE PARADOXE ================= */
  slide({
    n: 2, free: [0, 837],
    photo: band('02-fenetre.jpg', 'luxury office window paris', 837, 513),
    blocks: `
        <h1 class="h1" style="font-size:58px;max-width:720px">Le paradoxe que personne ne regarde.</h1>
        <p class="p" style="max-width:700px">Tout le monde fantasme sur Dubaï. Pendant ce temps, les grandes
          fortunes françaises restent en France. Elles connaissent pourtant tous les paradis fiscaux
          de la planète.</p>
        <p class="it" style="font-size:36px;max-width:640px">Elles ont une architecture. Pas une adresse.</p>`
  }),

  /* ================= 03 · L'ÉTAGE ================= */
  slide({
    n: 3,
    blocks: `
        <h1 class="h1" style="font-size:56px">TOI</h1>
        <p class="p" style="font-size:36px;margin-top:26px">&darr;</p>
        <h1 class="h1" style="font-size:56px;margin-top:26px">TA HOLDING</h1>
        <p class="p" style="font-size:36px;margin-top:26px">&darr;</p>
        <h1 class="h1" style="font-size:56px;margin-top:26px">TA SOCIÉTÉ</h1>
        <p class="p" style="max-width:700px">Une société qui détient tes autres sociétés. Pas de magie,
          pas de paradis fiscal. Une société française, 100% légale.</p>
        <p class="it" style="font-size:36px;max-width:660px">Et cet étage change toutes les règles du jeu.</p>`
  }),

  /* ================= 04 · LA REMONTÉE ================= */
  slide({
    n: 4, free: [0, 878],
    photo: band('04-coffre.jpg', 'bank vault door black white', 878, 472),
    blocks: `
        <h1 class="h1" style="font-size:62px;max-width:470px">Le mécanisme : la remontée.</h1>
        <p class="p" style="max-width:700px">Sans holding : tes dividendes subissent la flat tax. 30%.
          Avec holding : ils remontent via le régime mère-fille. 95% exonérés.</p>
        <div style="display:flex;gap:140px;align-items:baseline">
          <span class="fig fig--struck" style="font-size:86px">30%</span>
          <span class="fig fig--ul" style="font-size:86px">&asymp;1,5%</span>
        </div>`
  }),

  /* ================= 05 · LA NUANCE ================= */
  slide({
    n: 5,
    blocks: `
        <h1 class="h1" style="font-size:66px">La nuance importante.</h1>
        <p class="p" style="max-width:700px">Cet argent appartient à ta holding, pas à ton compte perso.
          Pour tout sortir, la flat tax s'applique au bout du compte. La holding n'est pas une baguette
          magique pour consommer.</p>
        <p class="it" style="font-size:56px;max-width:720px">C'est une machine à capitaliser.</p>`
  }),

  /* ================= 06 · CAPITALISER ================= */
  slide({
    n: 6, free: [472, 1350],
    photo: band('06-architecture.jpg', 'modern architecture building growth', 0, 472),
    blocks: `
        <h1 class="h1" style="font-size:62px">La machine à capitaliser.</h1>
        <p class="p" style="max-width:700px">Dans ta holding, ton argent travaille quasi non fiscalisé.
          Immobilier. Placements. Rachat de sociétés. Chaque euro réinvesti n'a subi ni flat tax
          ni barème.</p>
        <p class="it" style="font-size:36px;max-width:660px">Les riches ne sortent pas leur argent.
          Ils le font tourner.</p>`
  }),

  /* ================= 07 · LA REVENTE ================= */
  slide({
    n: 7, free: [472, 1350],
    photo: band('07-poignee.jpg', 'handshake deal black white minimal', 0, 472),
    blocks: `
        <h1 class="h1" style="font-size:56px;max-width:760px">Le bonus que personne ne connaît :
          la revente.</h1>
        <p class="p" style="max-width:700px">Vendre ta société en direct : imposition immédiate sur
          la plus-value. La vendre via ta holding, avec l'apport-cession : le produit peut être
          réinvesti sans imposition immédiate.</p>
        <p class="it" style="font-size:34px;max-width:680px">Des fondateurs ont revendu des millions
          comme ça. Légalement. En France.</p>`
  }),

  /* ================= 08 · À PARTIR DE QUAND ================= */
  slide({
    n: 8,
    blocks: `
        <h1 class="h1" style="font-size:66px">À partir de quand ?</h1>
        <p class="p" style="max-width:760px;margin-top:70px">&mdash;&ensp;Tu dégages plus que tes besoins de vie.</p>
        <p class="p" style="max-width:760px;margin-top:38px">&mdash;&ensp;Tu veux investir : immobilier, placements, business.</p>
        <p class="p" style="max-width:760px;margin-top:38px">&mdash;&ensp;Une revente se profile à moyen terme.</p>
        <p class="it" style="font-size:34px;max-width:700px;margin-top:70px">En dessous : inutile de
          complexifier. Au-dessus : chaque année sans holding coûte.</p>`
  }),

  /* ================= 09 · L'ORDRE ================= */
  slide({
    n: 9, free: [0, 810],
    photo: band('09-echecs.jpg', 'chess piece minimal black white', 810, 540),
    blocks: `
        <h1 class="h1" style="font-size:56px;max-width:740px">Les riches n'ont pas un secret.
          Ils ont un ordre.</h1>
        <p class="p" style="max-width:700px">D'abord l'architecture. Ensuite les revenus. Enfin le
          patrimoine. Toi, on t'a appris l'inverse : encaisse, paie, débrouille-toi.</p>
        <p class="it" style="font-size:36px;max-width:640px">La holding t'attend. En France. Sans visa.</p>`
  }),

  /* ================= 10 · CTA ================= */
  slide({
    n: 10, sign: 28,
    blocks: `
        <h1 class="h1" style="font-size:88px">Commente FRANCE</h1>
        <p class="p" style="max-width:600px">Je te donne mes conseils en DM.</p>`
  })

]};
