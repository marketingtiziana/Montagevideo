/* ============================================================
   FYNOVATES / Madame Caci — « Pourquoi Sami a monte sa societe
   a Hong Kong ». 9 slides, meme DA que le deck « societe ».
   Textes repris strictement ; les intitules de sections servent
   d'etiquettes mono (sauf HOOK et CTA, mots de production).
   ============================================================ */

const DECOR = '';

const nav  = n => `<div class="nav">${String(n).padStart(2, '0')} / 09</div>`;
const sign = (size = 20) =>
  `<div class="sign" style="font-size:${size}px;top:${1216 - size}px">MADAME CACI</div>`;
const swipe = t => `<div class="swipe">${t}</div>`;
const kick  = (t, top) => `<div class="kick" style="top:${top}px">${t}</div>`;

// EFFET 7 : le mot double en gris clair, decale derriere
const ghost = w => `<span class="gh"><span class="gh-b">${w}</span><span class="gh-f">${w}</span></span>`;

const slides = [

  /* ---------- 01 · HOOK — echelle extreme + ombre ---------- */
  { main: `
    ${nav(1)}
    <div class="b" style="top:394px;text-align:center">
      <div class="t" style="font-size:58px">Pourquoi Sami a mont&eacute;<br>sa soci&eacute;t&eacute; &agrave;</div>
      <div class="giant" style="font-size:215px;margin-top:44px">${ghost('HONG')}</div>
      <div class="giant" style="font-size:215px;margin-top:4px">${ghost('KONG.')}</div>
    </div>
    ${swipe('Swipe.')}${sign()}` },

  /* ---------- 02 · SAMI — etiquette verticale + filets ---------- */
  { main: `
    ${nav(2)}
    <div class="vlabel" style="left:112px;top:600px">SAMI</div>
    <div class="b" style="left:236px;width:754px;top:232px">
      <div class="r1"></div>
      <div class="li">E-commer&ccedil;ant, 31 ans. 45k&euro;/mois de CA.</div>
      <div class="r1"></div>
      <div class="li">Il source ses produits &agrave; Shenzhen, en Chine.</div>
      <div class="r1"></div>
      <div class="li">Il vend en Europe, aux US, en Australie.</div>
      <div class="r1"></div>
      <div class="li">Et il vit en Asie du Sud-Est depuis 2 ans.</div>
      <div class="r1"></div>
    </div>
    <div class="b" style="left:236px;width:754px;top:900px">
      <div class="it" style="font-size:40px">Un d&eacute;tail clochait&nbsp;: sa soci&eacute;t&eacute;, elle,<br>&eacute;tait rest&eacute;e en France.</div>
    </div>
    ${sign()}` },

  /* ---------- 03 · LE QUOTIDIEN QUI COINCE — filet epais ---------- */
  { main: `
    ${nav(3)}
    ${kick('LE QUOTIDIEN QUI COINCE', 212)}
    <div class="b" style="top:310px">
      <p class="pp">Sa banque fran&ccedil;aise bloquait un virement sur deux vers ses fournisseurs chinois.</p>
      <p class="pp">Les conversions de devises le rongeaient &agrave; chaque commande.</p>
      <p class="pp">Et sa SASU payait l&rsquo;imp&ocirc;t fran&ccedil;ais sur une activit&eacute; qui ne touchait plus la France depuis longtemps.</p>
    </div>
    <div class="b" style="top:862px">
      <div class="r6"></div>
      <div class="t" style="font-size:46px;margin-top:52px">Son business &eacute;tait devenu international.</div>
      <div class="t" style="font-size:46px;margin-top:22px">Sa structure vivait encore &agrave; Paris.</div>
    </div>
    ${sign()}` },

  /* ---------- 04 · LA GEOGRAPHIE — ligne de devises ---------- */
  { main: `
    ${nav(4)}
    ${kick('PREMI&Egrave;RE RAISON &mdash; LA G&Eacute;OGRAPHIE', 212)}
    <div class="b" style="top:302px">
      <div class="t" style="font-size:54px">Shenzhen est &agrave; 30 minutes<br>de Hong Kong.</div>
    </div>
    <div class="b" style="top:498px">
      <p class="pp">HK est LA porte d&rsquo;entr&eacute;e historique du commerce avec la Chine.</p>
      <p class="pp">Comptes multidevises naturels&nbsp;:</p>
    </div>
    <div class="b" style="top:688px">
      <div class="devises"><span>USD</span><i></i><span>EUR</span><i></i><span>CNY</span><i></i><span>HKD</span></div>
    </div>
    <div class="b" style="top:800px">
      <p class="pp">Payer un fournisseur chinois depuis HK&nbsp;? La routine bancaire.</p>
      <p class="pp">Ce qui faisait tiquer son banquier fran&ccedil;ais est ici le quotidien de toutes les banques.</p>
    </div>
    ${sign()}` },

  /* ---------- 05 · LA FISCALITE TERRITORIALE — echelle extreme ---------- */
  { main: `
    ${nav(5)}
    ${kick('DEUXI&Egrave;ME RAISON &mdash; LA FISCALIT&Eacute; TERRITORIALE', 212)}
    <div class="b" style="top:296px">
      <p class="pp">Hong Kong ne taxe que les profits de <span class="mono">SOURCE</span> hongkongaise.</p>
      <p class="pp">Sami source en Chine et vend en Occident&nbsp;: ses profits peuvent &ecirc;tre qualifi&eacute;s d&rsquo;offshore, sur dossier solide.</p>
    </div>
    <div class="b" style="top:578px">
      <p class="pp" style="line-height:1.9">R&eacute;sultat possible&nbsp;:
        <span class="fig" style="font-size:112px">0%</span> d&rsquo;imp&ocirc;t sur cette activit&eacute;.</p>
    </div>
    <div class="b" style="top:852px">
      <div class="r1"></div>
      <p class="pp" style="margin-top:40px">Et sinon&nbsp;? 8,25% jusqu&rsquo;&agrave; 2M HKD de profits. 16,5% au-del&agrave;.</p>
      <p class="pp" style="margin-top:22px">Pas de TVA. Pas d&rsquo;imp&ocirc;t sur les dividendes sortants.</p>
    </div>
    ${sign()}` },

  /* ---------- 06 · CE QUI FAIT TENIR — pave inverse ---------- */
  { main: `
    ${nav(6)}
    <div class="vlabel" style="left:112px;top:1150px">CE QUI FAIT TENIR LE MONTAGE</div>
    <div class="b" style="left:236px;width:754px;top:220px">
      <div class="it" style="font-size:38px">Voici ce que les vendeurs de soci&eacute;t&eacute;s<br>en ligne oublient de dire.</div>
    </div>
    <div class="b" style="left:236px;width:754px;top:392px">
      <p class="pp">Sami vit en Asie avec une <span class="mono">VRAIE</span> r&eacute;sidence fiscale &eacute;tablie.</p>
      <p class="pp">Sa soci&eacute;t&eacute; a de la substance&nbsp;: activit&eacute; r&eacute;elle, dossier document&eacute;.</p>
      <p class="pp">Il ne pilote rien depuis la France.</p>
    </div>
    <div class="b" style="left:236px;width:754px;top:862px">
      <p class="pp">Une soci&eacute;t&eacute; HK g&eacute;r&eacute;e depuis un salon parisien&nbsp;?</p>
      <div style="margin-top:28px"><span class="pave" style="font-size:38px">Elle est fran&ccedil;aise aux yeux du fisc. Point.</span></div>
    </div>
    ${sign()}` },

  /* ---------- 07 · LE RESULTAT — chiffres-vedettes + filet epais ---------- */
  { main: `
    ${nav(7)}
    ${kick('LE R&Eacute;SULTAT', 212)}
    <div class="b" style="top:304px">
      <p class="pp" style="line-height:1.9">Avant&nbsp;: sur 100&euro; encaiss&eacute;s, environ
        <span class="fig fig--nav" style="font-size:84px">43&euro;</span> nets dans sa poche.</p>
    </div>
    <div class="b" style="top:524px"><div class="r6"></div></div>
    <div class="b" style="top:578px">
      <p class="pp" style="line-height:1.9">Apr&egrave;s&nbsp;: entre
        <span class="fig" style="font-size:84px">85 et 95&euro;</span> selon les flux.</p>
    </div>
    <div class="b" style="top:812px">
      <p class="pp">Sur son CA annuel, l&rsquo;&eacute;cart se compte en dizaines de milliers d&rsquo;euros.</p>
    </div>
    <div class="b" style="top:982px">
      <div class="t" style="font-size:42px">M&ecirc;me business. M&ecirc;mes fournisseurs.<br>M&ecirc;mes clients.</div>
      <div class="it" style="font-size:38px;margin-top:30px">Seule l&rsquo;architecture a chang&eacute;.</div>
    </div>
    ${sign()}` },

  /* ---------- 08 · POUR QUI — contour vs plein + surlignage ---------- */
  { main: `
    ${nav(8)}
    ${kick('POUR QUI &Ccedil;A MARCHE (ET POUR QUI NON)', 212)}
    <div class="b" style="top:292px">
      <div class="t" style="font-size:84px">Taill&eacute; pour&nbsp;:</div>
      <p class="pp" style="margin-top:22px">sourcing en Asie, clients internationaux, vraie vie hors de France, CA qui justifie la structure.</p>
    </div>
    <div class="b" style="top:586px">
      <div class="t out out--xl" style="font-size:84px">Absurde pour&nbsp;:</div>
      <p class="pp" style="margin-top:22px">le freelance 100% clients fran&ccedil;ais, celui qui vit &agrave; Lyon, le CA de 3k/mois.</p>
    </div>
    <div class="b" style="top:898px">
      <p class="pp">Hong Kong n&rsquo;est pas un bon plan.</p>
      <p class="pp" style="margin-top:22px">C&rsquo;est un bon <span class="inv">OUTIL.</span> Pour le bon profil.</p>
    </div>
    ${sign()}` },

  /* ---------- 09 · CTA — echelle extreme + ombre ---------- */
  { main: `
    ${nav(9)}
    <div class="b" style="top:290px;text-align:center">
      <p class="pp">Ton profil ressemble &agrave; celui de Sami&nbsp;? Ou pas du tout&nbsp;?</p>
      <p class="pp" style="margin-top:22px">C&rsquo;est exactement ce qu&rsquo;on d&eacute;termine ensemble.</p>
    </div>
    <div class="b" style="top:520px;text-align:center">
      <div class="t" style="font-size:88px">Commente</div>
      <div class="giant" style="font-size:152px;margin-top:26px">${ghost('HONG')}</div>
      <div class="giant" style="font-size:152px;margin-top:4px">${ghost('KONG')}</div>
      <p class="pp" style="margin-top:48px">ou envoie-moi un DM</p>
    </div>
    ${sign(28)}` },
];

module.exports = { DECOR, slides };
