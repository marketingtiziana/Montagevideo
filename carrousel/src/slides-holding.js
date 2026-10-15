/* ============================================================
   FYNOVATES / Madame Caci — Deck « holding »
   « La holding française » — direction artistique éditoriale :
   noir sur blanc, photos noir et blanc en blocs nets, 100px de marge.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const DECOR = '';                     /* aucun décor : c'est la règle du style */

/* pagination, signature, invite à glisser */
const nav = (n, { left = 100, top = 100 } = {}) =>
  `<div class="ed-nav" style="left:${left}px;top:${top}px">${String(n).padStart(2, '0')} / 10</div>`;
const sign = ({ left = 100, top = null, size = 20 } = {}) =>
  `<div class="ed-sign" style="left:${left}px;${top === null ? 'bottom:100px' : `top:${top}px`};font-size:${size}px">MADAME CACI</div>`;

/* bloc photo : noir et blanc, bords francs ; repli gris si le fichier manque */
const photo = (file, keyword, style) => {
  const abs = path.join(__dirname, '..', 'assets', 'holding', file);
  return fs.existsSync(abs)
    ? `<div class="ph bleed" style="${style}"><img src="REL_TOKEN/assets/holding/${file}" alt=""></div>`
    : `<div class="ph-miss bleed" style="${style}">${keyword.toUpperCase()}</div>`;
};

module.exports = { DECOR, slides: [

  /* ================= 01 · COUVERTURE ================= */
  {
    main: `
      ${photo('01-haussmann.jpg', 'paris haussmann architecture facade',
              'left:0;top:0;width:1080px;height:607px')}
      ${nav(1, { top: 664 })}
      <h1 class="h1" style="left:100px;top:742px;font-size:108px">La holding<br>française.</h1>
      <p class="p" style="left:100px;top:1024px;width:770px">
        L'arme fiscale que les riches utilisent sans quitter Paris.</p>
      ${sign()}
      <div class="ed-swipe" style="right:100px;bottom:100px">glisser &rarr;</div>`
  },

  /* ================= 02 · LE PARADOXE ================= */
  {
    main: `
      ${photo('02-fenetre.jpg', 'luxury office window paris',
              'left:648px;top:0;width:432px;height:1350px')}
      ${nav(2)}
      <h1 class="h1" style="left:100px;top:232px;width:480px;font-size:60px">
        Le paradoxe que personne ne regarde.</h1>
      <p class="p" style="left:100px;top:486px;width:480px">
        Tout le monde fantasme sur Dubaï. Pendant ce temps, les grandes fortunes
        françaises restent en France. Elles connaissent pourtant tous les paradis
        fiscaux de la planète.</p>
      <p class="it" style="left:100px;top:1010px;width:480px;font-size:40px">
        Elles ont une architecture. Pas une adresse.</p>
      ${sign()}`
  },

  /* ================= 03 · L'ÉTAGE ================= */
  {
    main: `
      ${nav(3)}
      <h1 class="h1" style="left:100px;top:300px;width:880px;font-size:60px;text-align:center">TOI</h1>
      <p class="p" style="left:100px;top:386px;width:880px;text-align:center;font-size:40px">&darr;</p>
      <h1 class="h1" style="left:100px;top:452px;width:880px;font-size:60px;text-align:center">TA HOLDING</h1>
      <p class="p" style="left:100px;top:538px;width:880px;text-align:center;font-size:40px">&darr;</p>
      <h1 class="h1" style="left:100px;top:604px;width:880px;font-size:60px;text-align:center">TA SOCIÉTÉ</h1>
      <p class="p" style="left:170px;top:760px;width:740px;text-align:center">
        Une société qui détient tes autres sociétés. Pas de magie, pas de paradis fiscal.
        Une société française, 100% légale.</p>
      <p class="it" style="left:170px;top:980px;width:740px;text-align:center;font-size:38px">
        Et cet étage change toutes les règles du jeu.</p>
      ${sign()}`
  },

  /* ================= 04 · LA REMONTÉE ================= */
  {
    main: `
      ${nav(4)}
      <h1 class="h1" style="left:100px;top:196px;width:880px;font-size:72px">
        Le mécanisme : la remontée.</h1>
      <p class="p" style="left:100px;top:416px;width:820px">
        Sans holding : tes dividendes subissent la flat tax. 30%.
        Avec holding : ils remontent via le régime mère-fille. 95% exonérés.</p>
      <div style="position:absolute;left:100px;top:628px;width:880px;display:flex;
                  justify-content:space-between;align-items:baseline">
        <span class="fig fig--struck" style="font-size:104px">30%</span>
        <span class="fig fig--ul" style="font-size:104px">&asymp;1,5%</span>
      </div>
      ${sign({ top: 806 })}
      ${photo('04-coffre.jpg', 'bank vault door black white',
              'left:0;top:878px;width:1080px;height:472px')}`
  },

  /* ================= 05 · LA NUANCE ================= */
  {
    main: `
      ${nav(5)}
      <h1 class="h1" style="left:100px;top:220px;width:880px;font-size:72px">La nuance importante.</h1>
      <p class="p" style="left:100px;top:390px;width:820px">
        Cet argent appartient à ta holding, pas à ton compte perso. Pour tout sortir,
        la flat tax s'applique au bout du compte. La holding n'est pas une baguette
        magique pour consommer.</p>
      <p class="it" style="left:100px;top:720px;width:820px;font-size:64px">
        C'est une machine à capitaliser.</p>
      ${sign()}`
  },

  /* ================= 06 · CAPITALISER ================= */
  {
    main: `
      ${photo('06-architecture.jpg', 'modern architecture building growth',
              'left:0;top:0;width:432px;height:1350px')}
      ${nav(6, { left: 532 })}
      <h1 class="h1" style="left:532px;top:232px;width:448px;font-size:58px">
        La machine à capitaliser.</h1>
      <p class="p" style="left:532px;top:430px;width:448px">
        Dans ta holding, ton argent travaille quasi non fiscalisé. Immobilier.
        Placements. Rachat de sociétés. Chaque euro réinvesti n'a subi ni flat tax
        ni barème.</p>
      <p class="it" style="left:532px;top:880px;width:448px;font-size:38px">
        Les riches ne sortent pas leur argent. Ils le font tourner.</p>
      ${sign({ left: 532 })}`
  },

  /* ================= 07 · LA REVENTE ================= */
  {
    main: `
      ${photo('07-poignee.jpg', 'handshake deal black white minimal',
              'left:0;top:0;width:1080px;height:472px')}
      ${nav(7, { top: 532 })}
      <h1 class="h1" style="left:100px;top:606px;width:880px;font-size:64px">
        Le bonus que personne ne connaît : la revente.</h1>
      <p class="p" style="left:100px;top:812px;width:850px">
        Vendre ta société en direct : imposition immédiate sur la plus-value.
        La vendre via ta holding, avec l'apport-cession : le produit peut être
        réinvesti sans imposition immédiate.</p>
      <p class="it" style="left:100px;top:1092px;width:850px;font-size:38px">
        Des fondateurs ont revendu des millions comme ça. Légalement. En France.</p>
      ${sign()}`
  },

  /* ================= 08 · À PARTIR DE QUAND ================= */
  {
    main: `
      ${nav(8)}
      <h1 class="h1" style="left:100px;top:220px;width:880px;font-size:72px">À partir de quand ?</h1>
      <p class="p" style="left:100px;top:430px;width:880px">&mdash;&ensp;Tu dégages plus que tes besoins de vie.</p>
      <p class="p" style="left:100px;top:548px;width:880px">&mdash;&ensp;Tu veux investir : immobilier, placements, business.</p>
      <p class="p" style="left:100px;top:666px;width:880px">&mdash;&ensp;Une revente se profile à moyen terme.</p>
      <p class="it" style="left:100px;top:860px;width:850px;font-size:38px">
        En dessous : inutile de complexifier. Au-dessus : chaque année sans holding coûte.</p>
      ${sign()}`
  },

  /* ================= 09 · L'ORDRE ================= */
  {
    main: `
      ${nav(9)}
      <h1 class="h1" style="left:100px;top:180px;width:880px;font-size:62px">
        Les riches n'ont pas un secret. Ils ont un ordre.</h1>
      <p class="p" style="left:100px;top:420px;width:820px">
        D'abord l'architecture. Ensuite les revenus. Enfin le patrimoine.
        Toi, on t'a appris l'inverse : encaisse, paie, débrouille-toi.</p>
      <p class="it" style="left:100px;top:630px;width:820px;font-size:44px">
        La holding t'attend. En France. Sans visa.</p>
      ${sign({ top: 742 })}
      ${photo('09-echecs.jpg', 'chess piece minimal black white',
              'left:0;top:810px;width:1080px;height:540px')}`
  },

  /* ================= 10 · CTA ================= */
  {
    main: `
      ${nav(10)}
      <h1 class="h1" style="left:100px;top:560px;width:880px;font-size:92px;text-align:center">
        Commente FRANCE</h1>
      <p class="p" style="left:100px;top:720px;width:880px;text-align:center">
        Je te donne mes conseils en DM.</p>
      <div class="ed-sign" style="left:100px;bottom:100px;width:880px;text-align:center;font-size:28px">
        MADAME CACI</div>`
  }

]};
