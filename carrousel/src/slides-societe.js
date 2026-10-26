/* ============================================================
   FYNOVATES / Madame Caci — « Je peux payer quoi avec ma societe ? »
   9 slides. Minimalisme spectaculaire : noir sur blanc, zero photo,
   zero couleur. 1 a 2 effets typographiques par slide, pas plus.
   ============================================================ */

const DECOR = '';

const nav  = n => `<div class="nav">${String(n).padStart(2, '0')} / 09</div>`;
const sign = (size = 20) =>
  `<div class="sign" style="font-size:${size}px;top:${1216 - size}px">MADAME CACI</div>`;
const swipe = () => `<div class="swipe">glisser &rarr;</div>`;

// EFFET 7 : le mot double en gris clair, decale derriere
const ghost = w => `<span class="gh"><span class="gh-b">${w}</span><span class="gh-f">${w}</span></span>`;
// EFFET 3 : la barre editoriale inclinee
const struck = t => `<div class="sl"><span class="st">${t}</span></div>`;

const slides = [

  /* ---------- 01 · COUVERTURE — echelle extreme + ombre ---------- */
  { main: `
    ${nav(1)}
    <div class="kick" style="top:232px">LA QUESTION QUE TOUT LE MONDE SE POSE</div>
    <div class="b" style="top:500px">
      <div class="t" style="font-size:88px">Je peux payer</div>
      <div class="giant" style="font-size:220px;margin:16px 0 46px">${ghost('QUOI')}</div>
      <div class="t" style="font-size:88px">avec ma soci&eacute;t&eacute; ?</div>
    </div>
    ${swipe()}${sign()}` },

  /* ---------- 02 · LA REGLE — surlignage inverse + filets ---------- */
  { main: `
    ${nav(2)}
    <div class="vlabel" style="left:112px;top:1128px">R&Egrave;GLE N&deg;1</div>
    <div class="b" style="left:236px;width:754px;top:228px">
      <div class="t" style="font-size:76px">Une seule r&egrave;gle<br>d&eacute;cide de tout.</div>
    </div>
    <div class="b" style="left:236px;width:754px;top:522px">
      <div class="r1"></div>
      <p class="p" style="font-size:33px;line-height:1.95;padding:52px 0 56px">
        Une d&eacute;pense est d&eacute;ductible si elle est engag&eacute;e dans
        <span class="inv">l'int&eacute;r&ecirc;t</span> de ton entreprise, et
        <span class="inv">justifi&eacute;e</span>.</p>
      <div class="r1"></div>
    </div>
    <div class="b" style="left:236px;width:754px;top:972px">
      <div class="it" style="font-size:46px">Tout le reste en d&eacute;coule.</div>
    </div>
    ${sign()}` },

  /* ---------- 03 · CE QUI PASSE — filigrane ✓ + filets ---------- */
  { main: `
    ${nav(3)}
    <svg class="wm" style="left:268px;top:318px" width="700" height="700" viewBox="0 0 700 700">
      <path d="M 58 396 L 262 592 L 648 104" fill="none" stroke="#0A0A0A" stroke-width="86"
            stroke-linecap="round" stroke-linejoin="round" opacity="0.04"/>
    </svg>
    <div class="b" style="top:196px">
      <div class="t" style="font-size:72px">Ce qui passe. Sans d&eacute;bat.</div>
    </div>
    <div class="b" style="top:356px">
      <div class="r1"></div>
      <div class="li">Ton mat&eacute;riel : ordi, t&eacute;l&eacute;phone, &eacute;cran, bureau.</div>
      <div class="r1"></div>
      <div class="li">Tes logiciels et abonnements pro.</div>
      <div class="r1"></div>
      <div class="li">Tes formations li&eacute;es &agrave; ton activit&eacute;.</div>
      <div class="r1"></div>
      <div class="li">Tes d&eacute;placements professionnels, ton coworking.</div>
      <div class="r1"></div>
      <div class="li">Tes prestataires, ta pub, ton comptable.</div>
      <div class="r1"></div>
    </div>
    <div class="b" style="top:1000px">
      <p class="p" style="font-size:32px">Si &ccedil;a sert ton business : ta soci&eacute;t&eacute; paie. Normal.</p>
    </div>
    ${sign()}` },

  /* ---------- 04 · SOUS CONDITIONS — contour vs plein ---------- */
  { main: `
    ${nav(4)}
    <div class="b" style="top:206px">
      <div class="t" style="font-size:60px">Ce qui passe&hellip;</div>
      <div class="t out" style="font-size:112px;margin-top:10px">sous conditions.</div>
    </div>
    <div class="b" style="top:520px">
      <div class="li" style="padding:0 0 34px"><b>Les repas :</b> en d&eacute;placement ou avec un client. Pas ton d&eacute;jeuner quotidien.</div>
      <div class="li" style="padding:0 0 34px"><b>Le t&eacute;l&eacute;travail :</b> une quote-part de loyer, proportionn&eacute;e et document&eacute;e.</div>
      <div class="li" style="padding:0 0 34px"><b>Le v&eacute;hicule :</b> possible, mais encadr&eacute; et plafonn&eacute;.</div>
      <div class="li" style="padding:0"><b>Les cadeaux clients :</b> dans des limites raisonnables.</div>
    </div>
    <div class="b" style="top:1046px">
      <p class="p" style="font-size:30px">La fronti&egrave;re ici : la <span class="mono">PROPORTION</span> et la <span class="mono">TRA&Ccedil;ABILIT&Eacute;</span>.</p>
    </div>
    ${sign()}` },

  /* ---------- 05 · CE QUI NE PASSE PAS — barres editoriales ---------- */
  { main: `
    ${nav(5)}
    <div class="b" style="top:212px">
      <div class="t" style="font-size:76px">Ce qui ne passe pas.</div>
    </div>
    <div class="b" style="top:400px">
      ${struck('Tes vacances rep&eacute;rage de march&eacute; &agrave; Bali.')}
      ${struck('Les courses de la semaine.')}
      ${struck('Les v&ecirc;tements de tous les jours.')}
      ${struck('Le resto en amoureux.')}
    </div>
    <div class="b" style="top:958px">
      <p class="p" style="font-size:31px">Ta vie perso n'est pas une charge d'exploitation.<br>
        M&ecirc;me maquill&eacute;e. Surtout maquill&eacute;e.</p>
    </div>
    ${sign()}` },

  /* ---------- 06 · LES NOMS — paves inverses + etiquette verticale ---------- */
  { main: `
    ${nav(6)}
    <div class="vlabel" style="left:112px;top:1152px">POURQUOI JE TE DIS &Ccedil;A CASH</div>
    <div class="b" style="left:236px;width:754px;top:214px">
      <p class="p" style="font-size:32px">Faire passer du perso en pro,<br>&ccedil;a porte des noms pr&eacute;cis :</p>
    </div>
    <div class="b" style="left:236px;width:754px;top:400px">
      <div><span class="pave" style="font-size:32px">avantage en nature non d&eacute;clar&eacute;</span></div>
      <div style="margin-top:26px"><span class="pave" style="font-size:44px">acte anormal de gestion</span></div>
      <div style="margin-top:26px"><span class="pave" style="font-size:58px">abus de biens sociaux</span></div>
    </div>
    <div class="b" style="left:236px;width:754px;top:1002px">
      <p class="p" style="font-size:31px">Le resto offert par ta soci&eacute;t&eacute; peut devenir le plus cher de ta vie.</p>
    </div>
    ${sign()}` },

  /* ---------- 07 · LE VRAI LEVIER — echelle extreme + filet epais ---------- */
  { main: `
    ${nav(7)}
    <div class="b" style="top:198px">
      <div class="t" style="font-size:64px">Le vrai levier.<br>Que personne ne regarde.</div>
    </div>
    <div class="b" style="top:382px">
      <p class="p" style="font-size:30px">Pendant que certains grattent 40&euro; de resto, les entrepreneurs
        structur&eacute;s jouent sur de vrais leviers : le bon statut, l'arbitrage
        salaire/dividendes, la holding, le r&eacute;investissement.</p>
    </div>
    <div class="b" style="top:748px">
      <div class="t" style="font-size:60px;color:var(--nav);font-weight:700">40&euro;</div>
      <div class="r6" style="margin:46px 0 52px"></div>
      <div class="giant" style="font-size:160px">
        <span style="font-family:'Inter',sans-serif;font-weight:300;font-size:46px;letter-spacing:0">des</span>
        MILLIERS</div>
    </div>
    ${sign()}` },

  /* ---------- 08 · LA HIERARCHIE — escalier + filigrane 1 2 3 ---------- */
  { main: `
    ${nav(8)}
    <div class="wm" style="left:96px;top:566px;font-size:420px;opacity:0.05;letter-spacing:0.06em">1 2 3</div>
    <div class="b" style="top:200px">
      <div class="t" style="font-size:70px">La hi&eacute;rarchie &agrave; retenir.</div>
    </div>
    <div class="b" style="top:372px">
      <div class="p" style="font-size:32px;line-height:1.35">Niveau 1 &mdash; D&eacute;duire proprement ce qui est d&eacute;ductible.</div>
      <div class="p" style="font-size:40px;line-height:1.3;margin:54px 0 0 70px;width:830px">Niveau 2 &mdash; Choisir la bonne structure pour ton CA.</div>
      <div class="p" style="font-size:48px;line-height:1.25;font-weight:600;margin:54px 0 0 140px;width:760px">Niveau 3 &mdash; Architecturer : r&eacute;mun&eacute;ration, holding, patrimoine.</div>
    </div>
    <div class="b" style="top:1016px">
      <div class="it" style="font-size:38px">La vraie question : est-ce que ta structure travaille pour toi ?</div>
    </div>
    ${sign()}` },

  /* ---------- 09 · CTA — echelle extreme + ombre, slide presque vide ---------- */
  { main: `
    ${nav(9)}
    <div class="b" style="top:454px">
      <div class="giant" style="font-size:160px">Commente</div>
      <div class="giant" style="font-size:200px;margin-top:8px">${ghost('FRANCE')}</div>
    </div>
    <div class="b" style="top:912px">
      <p class="p" style="font-size:34px">Je te donne mes conseils en DM.</p>
    </div>
    ${sign(28)}` },
];

module.exports = { DECOR, slides };
