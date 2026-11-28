/* Every mockup of the identity book, at native size. render-visuals.cjs screenshots each [data-out] element.
   Tiziana appears only through her real photographs (../photographies/tiziana) and cutouts made from them. */
;(function () {
  const { C, mark, markAt, TEX, GRADE, photo, full } = window.BRAND
  const L = window.LIB
  const PH = (k) => `../photographies/tiziana/tz-${k}.jpg`
  const CUT = (k) => `../photographies/detourages/tz-${k}.png`
  const FR = 'Fraunces', IN = 'Inter', MA = 'Manrope'
  const A = (css, inner = '') => `<div style="position:absolute;${css}">${inner}</div>`
  const T = (css, txt) => `<div style="position:absolute;${css}">${txt}</div>`
  const fr = (t) => t.replace(/ ([?:!;»])/g, ' $1').replace(/« /g, '« ')
  const box = (w, h, bg, inner) => `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${bg}">${fr(inner)}</div>`
  const items = []
  const add = (out, w, h, html, scale = 1) => items.push({ out, w, h, html, scale })
  const kick = (txt, c, css) => T(`${css};font:700 22px/1 ${MA};letter-spacing:.24em;text-transform:uppercase;color:${c}`, txt)
  const sig = (c, css = 'left:80px;bottom:70px') => T(`${css};font:600 20px/1 ${MA};letter-spacing:.26em;color:${c}`, 'TIZIANA CACI')
  // a word underlined by the red mark, inline in a title
  const U = (word, h = 0.2) => `<span style="position:relative;display:inline-block">${word}<svg viewBox="0 0 400 40" preserveAspectRatio="none" style="position:absolute;left:-2%;bottom:-${h * 0.55}em;width:104%;height:${h}em"><path d="${window.BRAND.MARK.underline(400, 40)}" fill="${C.grenat}"/></svg></span>`
  const O = (word) => `<span style="position:relative;display:inline-block">${word}<svg viewBox="0 0 300 160" preserveAspectRatio="none" style="position:absolute;left:-12%;top:-28%;width:124%;height:156%;overflow:visible"><path d="${window.BRAND.MARK.circle(300, 160)}" fill="${C.grenat}"/></svg></span>`
  const fmt = (name, c) => T(`left:80px;top:80px;display:flex;align-items:center;gap:16px;font:700 20px/1 ${MA};letter-spacing:.24em;text-transform:uppercase;color:${c}`, `${mark('vertical', 10, 34, 'display:block')}${name}`)

  /* ---------------- textures ---------------- */
  ;['enduit', 'travertin', 'papier', 'espresso', 'cuir', 'bois', 'murBrun'].forEach((k) => add(`textures/${k}.jpg`, 1600, 1000, box(1600, 1000, C.craie, TEX[k]()), 1))

  /* ---------------- graded portraits ---------------- */
  ;['studio-marine', 'studio-marine-reflexion', 'studio-vert-reflexion', 'bibliotheque-ordinateur', 'bibliotheque-sourire', 'fenetre-ronde-ordinateur', 'table-reflexion', 'restaurant-bras-croises', 'dejeuner-affaires', 'voyage-valise-fenetre', 'balcon-telephone', 'fenetre-ronde-lecture'].forEach((k) =>
    add(`photographies/etalonnees/${k}.jpg`, 1125, 1500, box(1125, 1500, C.espresso, photo(PH(k), 'inset:0', '50% 30%', GRADE, false)), 1))

  /* ---------------- the 12 Instagram posts ---------------- */
  const P = []
  P[1] = () => box(1080, 1440, C.espresso, photo(PH('studio-marine'), 'inset:0', '50% 18%') + A('inset:0;background:linear-gradient(180deg,rgba(31,25,20,0) 45%,rgba(31,25,20,.85) 82%)') +
    T(`left:80px;top:${1440 - 470}px;width:900px;font:500 112px/0.95 ${FR};color:${C.ivoire};letter-spacing:-.02em`, `The ${U('reality')}<br>behind business`) +
    T(`left:80px;top:${1440 - 190}px;font:500 30px/1.3 ${IN};color:${C.sable}`, 'Voir. Vérifier. Comprendre. Décider.') + sig(C.sable))
  const reel = (k, n, title, sub, pos = '50% 18%') => box(1080, 1920, C.espresso, photo(PH(k), 'inset:0', pos) + A('inset:0;background:linear-gradient(180deg,rgba(31,25,20,.15) 0%,rgba(31,25,20,0) 22%,rgba(31,25,20,0) 48%,rgba(31,25,20,.88) 74%)') +
    T(`left:80px;top:300px;display:flex;align-items:center;gap:18px;padding:16px 26px;background:${C.craie};font:700 22px/1 ${MA};letter-spacing:.22em;color:${C.espresso}`, `${mark('vertical', 8, 26, 'display:block')}LE POINT DE CONTRÔLE · N°${n}`) +
    T(`left:80px;top:1160px;width:920px;font:500 94px/0.98 ${FR};color:${C.ivoire};letter-spacing:-.02em`, title) +
    T(`left:80px;top:1560px;width:880px;font:400 34px/1.35 ${IN};color:${C.sable}`, sub))
  P[2] = () => reel('bibliotheque-ordinateur', '01', `Résidence fiscale : le ${U('point')} qu’on oublie`, 'Ce que l’adresse ne suffit pas à prouver.', '40% 30%')
  P[3] = () => box(1080, 1440, C.craie, TEX.enduit() + fmt('The Reality Check', C.espresso) +
    T(`left:80px;top:260px;width:920px;font:400 italic 76px/1.08 ${FR};color:${C.bronze}`, '« Une société à l’étranger, c’est moins d’impôts. »') +
    A(`left:80px;top:640px;width:120px;height:3px;background:${C.espresso}`) +
    T(`left:80px;top:700px;width:920px;font:500 112px/0.98 ${FR};color:${C.espresso};letter-spacing:-.02em`, `Avant les avantages, les ${U('conditions')}.`) +
    T(`left:80px;bottom:150px;width:820px;font:400 30px/1.45 ${IN};color:${C.espresso}`, 'Substance, lieu de direction, résidence du dirigeant : ce qui décide vraiment.') + sig(C.bronze))
  P[4] = () => box(1080, 1440, C.espresso, TEX.espresso() + fmt('The Business Dossier', C.sable) +
    T(`left:80px;top:170px;font:400 380px/0.8 ${FR};color:rgba(231,222,210,.08)`, 'ViDA') +
    T(`left:80px;top:560px;width:920px;font:500 100px/0.98 ${FR};color:${C.ivoire};letter-spacing:-.02em`, `La TVA entre dans ${U('l’ère numérique')}`) +
    T(`left:80px;top:900px;width:860px;font:400 32px/1.45 ${IN};color:${C.sable}`, 'Directive (UE) 2025/516, adoptée le 11 mars 2025. Déploiement progressif jusqu’en 2035 : facturation électronique, déclarations en temps réel, plateformes.') +
    T(`left:80px;bottom:80px;font:600 20px/1 ${MA};letter-spacing:.2em;color:${C.bronze}`, 'DOSSIER · SOURCES OFFICIELLES UE'))
  P[5] = () => box(1080, 1440, C.craie, TEX.papier() + photo(PH('table-reflexion'), 'left:0;top:0;width:1080px;height:860px', '50% 30%') + fmt('The Executive Note', C.ivoire) +
    T(`left:80px;top:920px;width:920px;font:500 70px/1.05 ${FR};color:${C.espresso};letter-spacing:-.01em`, `Une décision n’est jamais ${U('isolée')}.`) +
    T(`left:80px;top:1130px;width:900px;font:400 29px/1.5 ${IN};color:${C.espresso}`, 'Note de dirigeante · le texte définitif sera écrit avec Tiziana, à partir de son expérience réelle.') + sig(C.bronze))
  const doc = (lines, hi, w = 760) => `<div style="position:relative;width:${w}px;background:#FBF8F3;box-shadow:0 30px 60px -25px rgba(31,25,20,.45);padding:56px 60px;font:400 24px/1.6 ${IN};color:#4A4038">${lines.map((l, i) => i === hi ? `<div style="position:relative;font-weight:600;color:${C.espresso}">${l}${mark('underline', w - 140, 22, 'position:absolute;left:-6px;bottom:-12px', C.grenat)}</div>` : `<div style="border-bottom:1px solid #E7DED2">${l}</div>`).join('')}</div>`
  P[6] = () => box(1080, 1440, C.sable, TEX.enduit(C.sable) + fmt('Things people don’t see', C.espresso) +
    T(`left:80px;top:170px;width:920px;font:500 84px/1 ${FR};color:${C.espresso};letter-spacing:-.02em`, 'Ce qu’une banque regarde avant d’ouvrir un compte pro') +
    A('left:160px;top:560px;transform:rotate(-2deg)', doc(['Activité réelle et clients', 'Origine des fonds', 'Pays de résidence du dirigeant', 'Cohérence société / activité / pays', 'Justificatifs disponibles'], 3)) +
    sig(C.espresso))
  P[7] = () => reel('studio-marine-reflexion', '02', `Expatriation : ce que la ${U('date de départ')} implique`, 'Une date, plusieurs conséquences. À vérifier avant de réserver.', '50% 15%')
  P[8] = () => box(1080, 1440, C.grenat, TEX.cuir() + T(`left:80px;top:90px;font:700 20px/1 ${MA};letter-spacing:.24em;color:${C.craie}`, 'CONVICTION') +
    T(`left:80px;top:420px;width:920px;font:500 116px/0.98 ${FR};color:${C.ivoire};letter-spacing:-.02em`, 'La liberté d’entreprendre ne va pas sans responsabilité.') + sig(C.craie))
  P[9] = () => box(1080, 1440, C.espresso, TEX.espresso() + fmt('The Business Dossier', C.sable) +
    T(`left:80px;top:170px;font:400 340px/0.8 ${FR};color:rgba(231,222,210,.08)`, 'DAC8') +
    T(`left:80px;top:540px;width:920px;font:500 92px/1 ${FR};color:${C.ivoire};letter-spacing:-.02em`, `Crypto-actifs : depuis le 1<sup style="font-size:.5em">er</sup> janvier 2026, les plateformes ${U('collectent')}`) +
    T(`left:80px;top:960px;width:860px;font:400 32px/1.45 ${IN};color:${C.sable}`, 'Directive (UE) 2023/2226. Premiers échanges entre administrations : au plus tard le 30 septembre 2027.') +
    T(`left:80px;bottom:80px;font:600 20px/1 ${MA};letter-spacing:.2em;color:${C.bronze}`, 'DOSSIER · SOURCES OFFICIELLES UE'))
  P[10] = () => box(1080, 1440, C.craie, photo(PH('fenetre-ronde-ordinateur'), 'inset:0', '50% 40%') + mark('vertical', 12, 160, 'position:absolute;left:70px;bottom:90px'))
  P[11] = () => box(1080, 1440, C.craie, TEX.enduit() + fmt('The Reality Check', C.espresso) +
    T(`left:80px;top:260px;width:920px;font:400 italic 80px/1.08 ${FR};color:${C.bronze}`, `« Il suffit de passer ${O('183 jours')} ailleurs. »`) +
    A(`left:80px;top:600px;width:120px;height:3px;background:${C.espresso}`) +
    T(`left:80px;top:660px;width:920px;font:500 106px/0.98 ${FR};color:${C.espresso};letter-spacing:-.02em`, 'Une décision n’est jamais isolée.') +
    T(`left:80px;bottom:150px;width:840px;font:400 30px/1.45 ${IN};color:${C.espresso}`, 'Foyer, activité, intérêts économiques : en France, le séjour n’est qu’un critère parmi d’autres.') + sig(C.bronze))
  P[12] = () => reel('studio-vert-reflexion', '03', `Factures électroniques : ce qui a ${U('changé')} le 1<sup style="font-size:.5em">er</sup> septembre 2026`, 'Réception obligatoire pour toutes les entreprises ; émission pour les PME en 2027.', '50% 15%')
  const POSTS = [null, 'portrait', 'reel-point-de-controle-01', 'reality-check-societe', 'dossier-vida', 'executive-note', 'things-banque', 'reel-point-de-controle-02', 'conviction-liberte', 'dossier-dac8', 'portrait-travail', 'reality-check-183-jours', 'reel-point-de-controle-03']
  const isReel = (i) => [2, 7, 12].includes(i)
  for (let i = 1; i <= 12; i++) add(`mockups/instagram/${String(i).padStart(2, '0')}-${POSTS[i]}.jpg`, 1080, isReel(i) ? 1920 : 1440, P[i](), 1)

  /* ---------------- Instagram profile mockup ---------------- */
  const fit = (html, nw, nh, dw, crop = 0) => { const s = dw / nw; return `<div style="position:relative;overflow:hidden;width:${dw}px;height:${Math.round((crop ? 1440 : nh) * s)}px"><div style="position:absolute;left:0;top:0;width:${nw}px;height:${nh}px;transform-origin:0 0;transform:translateY(${crop ? -240 * s : 0}px) scale(${s})">${html}</div></div>` }
  const ic = (i) => isReel(i) ? `<i style="position:absolute;top:7px;right:8px;font-style:normal;color:#fff;font-size:13px;text-shadow:0 1px 3px rgba(0,0,0,.6)">▶</i>` : ''
  const grid = (w) => `<div style="display:grid;grid-template-columns:repeat(3,${w}px);gap:3px">${Array.from({ length: 12 }, (_, k) => `<div style="position:relative">${fit(P[k + 1](), 1080, isReel(k + 1) ? 1920 : 1440, w, isReel(k + 1))}${ic(k + 1)}</div>`).join('')}</div>`
  const phone = `<div style="width:560px;background:#fff;border-radius:52px;padding:18px 0 8px;box-shadow:0 0 0 13px #1b1714;font:14.5px/1.45 ${IN};color:#111;overflow:hidden">
    <div style="display:flex;justify-content:space-between;padding:2px 34px 10px;font-weight:600">9:41<span>●●● ▮</span></div>
    <div style="display:flex;justify-content:space-between;padding:0 22px 12px;font:600 20px ${IN}">tiziana.caci ⌄<span>⊕ ☰</span></div>
    <div style="display:flex;align-items:center;gap:36px;padding:0 22px"><div style="width:100px;height:100px;border-radius:50%;background:url(${PH('studio-marine')}) 50% 14%/190% auto;box-shadow:0 0 0 3px #fff,0 0 0 5.5px ${C.grenat}"></div><div style="display:flex;gap:26px;text-align:center;font-size:13px"><div><b style="display:block;font-size:18px">12</b>publications</div><div><b style="display:block;font-size:18px">—</b>followers</div><div><b style="display:block;font-size:18px">—</b>suivi(e)s</div></div></div>
    <div style="padding:12px 22px"><b>Tiziana Caci</b><div style="color:#777">Entrepreneur</div><div>Fondatrice & directrice de <span style="color:#2b4a7a">@fynovates</span></div><div>The reality behind business.</div><div>Voir. Vérifier. Comprendre. Décider.</div><div style="color:#2b4a7a;font-weight:600">fynovates.com</div></div>
    <div style="display:flex;gap:8px;padding:2px 22px"><span style="flex:1;text-align:center;background:#3897f0;color:#fff;border-radius:9px;padding:8px 0;font-weight:600">Suivre</span><span style="flex:1;text-align:center;background:#efefef;border-radius:9px;padding:8px 0;font-weight:600">Message</span><span style="flex:1;text-align:center;background:#efefef;border-radius:9px;padding:8px 0;font-weight:600">Contact</span></div>
    <div style="display:flex;gap:20px;padding:14px 22px">${[['À propos de moi', C.espresso], ['Mon cabinet', C.craie], ['Point de contrôle', C.grenat]].map(([t, c]) => `<div style="text-align:center;font-size:12px;width:78px"><div style="width:70px;height:70px;margin:0 auto 6px;border-radius:50%;background:${c};box-shadow:0 0 0 2px #fff,0 0 0 3.5px #ccc;display:flex;align-items:center;justify-content:center">${mark('horizontal', 40, 12, '', c === C.grenat ? C.craie : C.grenat)}</div>${t}</div>`).join('')}</div>
    <div style="display:flex;border-top:1px solid #ddd"><span style="flex:1;text-align:center;padding:9px;border-bottom:1.5px solid #111">▦</span><span style="flex:1;text-align:center;padding:9px;color:#999">▶</span><span style="flex:1;text-align:center;padding:9px;color:#999">◎</span></div>
    <div style="display:flex;justify-content:center;padding:3px 0">${grid(176)}</div></div>`
  add('mockups/instagram/profil-instagram.png', 600, 1700, `<div style="padding:20px;background:transparent">${phone}</div>`, 2)
  add('mockups/instagram/grille-12.jpg', 1080, 1920, box(1080, 1920, '#fff', `<div style="padding:0">${grid(358)}</div>`), 1)

  /* ---------------- LinkedIn ---------------- */
  add('mockups/linkedin/banniere.jpg', 1584, 396, box(1584, 396, C.craie, TEX.enduit() +
    T(`left:560px;top:96px;font:500 74px/1 ${FR};color:${C.espresso};letter-spacing:-.02em`, `The ${U('reality')} behind business`) +
    T(`left:564px;top:226px;font:600 22px/1 ${MA};letter-spacing:.3em;color:${C.bronze}`, 'VOIR · VÉRIFIER · COMPRENDRE · DÉCIDER') +
    T(`left:564px;top:290px;font:400 20px/1 ${IN};color:${C.espresso}`, 'Tiziana Caci · Fondatrice & directrice de Fynovates')), 1)
  add('mockups/linkedin/photo-profil.png', 800, 800, `<div style="width:800px;height:800px;border-radius:50%;overflow:hidden;position:relative;background:${C.craie}">${TEX.enduit()}${photo(PH('studio-marine'), 'left:-40px;top:-10px;width:880px;height:1100px', '50% 10%', GRADE, false)}</div>`, 1)
  add('mockups/linkedin/post.jpg', 1100, 1820, box(1100, 1820, '#F4F2EE', `<div style="position:absolute;left:40px;top:40px;width:1020px;background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,.08);font:24px/1.5 ${IN};color:#1d1d1d;overflow:hidden">
    <div style="display:flex;gap:18px;align-items:center;padding:26px 30px"><div style="width:86px;height:86px;border-radius:50%;background:url(${PH('studio-marine')}) 50% 14%/190% auto"></div><div><b>Tiziana Caci</b><div style="font-size:19px;color:#666">Fondatrice & Directrice de Fynovates | Entrepreneuriat international | Structuration…</div><div style="font-size:18px;color:#888">1 j · 🌐</div></div></div>
    <div style="padding:0 30px 22px">Avant de regarder les avantages, regardons les conditions.<br><br>Une société créée à l’étranger ne dit rien, seule, de l’endroit où l’activité est réellement dirigée, exercée et imposée. […]<br><span style="color:#666">… voir plus</span></div>
    <div style="position:relative;height:1360px;overflow:hidden">${P[3]().replace('width:1080px;height:1440px', 'width:1080px;height:1440px;transform:scale(.944);transform-origin:0 0')}</div>
    <div style="display:flex;justify-content:space-around;padding:18px;border-top:1px solid #eee;color:#555;font-weight:600">👍 J’aime<span>💬 Commenter</span><span>↻ Republier</span><span>➤ Envoyer</span></div></div>`), 1)

  /* ---------------- YouTube ---------------- */
  add('mockups/youtube/miniature-point-de-controle.jpg', 1280, 720, box(1280, 720, C.espresso, TEX.espresso() +
    `<img src="${CUT('studio-marine')}" style="position:absolute;right:20px;bottom:0;height:700px;filter:${GRADE} drop-shadow(-20px 10px 30px rgba(0,0,0,.5))">` +
    T(`left:64px;top:56px;display:flex;align-items:center;gap:14px;font:700 20px/1 ${MA};letter-spacing:.22em;color:${C.sable}`, `${mark('vertical', 8, 26, 'display:block')}LE POINT DE CONTRÔLE`) +
    T(`left:60px;top:150px;width:700px;font:600 108px/0.95 ${FR};color:${C.ivoire};letter-spacing:-.03em`, `Société à l’étranger : le ${O('vrai')} critère`) +
    T(`left:64px;bottom:60px;font:500 26px/1 ${IN};color:${C.sable}`, 'Ce que cela implique réellement')), 1)
  add('mockups/youtube/miniature-business-dossier.jpg', 1280, 720, box(1280, 720, C.craie, TEX.enduit() + photo(PH('bibliotheque-sourire'), 'right:0;top:0;width:520px;height:720px', '50% 30%') +
    T(`left:64px;top:56px;display:flex;align-items:center;gap:14px;font:700 20px/1 ${MA};letter-spacing:.22em;color:${C.espresso}`, `${mark('vertical', 8, 26, 'display:block')}THE BUSINESS DOSSIER`) +
    T(`left:60px;top:150px;width:660px;font:600 100px/0.96 ${FR};color:${C.espresso};letter-spacing:-.03em`, `Compte pro à l’étranger : ${U('pourquoi')} ça bloque`) +
    T(`left:64px;bottom:60px;font:500 24px/1 ${IN};color:${C.bronze}`, 'Avec un expert du cabinet')), 1)

  /* ---------------- Le Point de Contrôle: 5-step storyboard (16:9) ---------------- */
  const lower = (n, t) => A(`left:90px;bottom:90px;display:flex;align-items:stretch;gap:0;box-shadow:0 20px 40px -20px rgba(0,0,0,.5)`, `<div style="background:${C.grenat};color:${C.ivoire};font:700 22px/1 ${MA};letter-spacing:.2em;padding:24px 26px">${n}</div><div style="background:${C.craie};color:${C.espresso};font:500 38px/1 ${FR};padding:20px 34px">${t}</div>`)
  const set1 = (extra = '', pos = 'right:120px') => TEX.enduit() + A('inset:0;background:linear-gradient(90deg,rgba(255,244,228,.35),rgba(48,40,32,.0) 45%,rgba(48,40,32,.25))') +
    `<img src="${CUT('studio-marine')}" style="position:absolute;${pos};bottom:120px;height:900px;filter:${GRADE} drop-shadow(-30px 20px 40px rgba(48,40,32,.35))">` + A('left:0;right:0;bottom:0;height:200px', TEX.bois()) + A('left:0;right:0;bottom:198px;height:6px;background:rgba(255,230,200,.2)') + extra
  const SB = [
    ['01', 'La situation', box(1920, 1080, C.craie, set1() + lower('01 · SITUATION', 'Créer sa société à Dubaï ?'))],
    ['02', 'L’idée reçue', box(1920, 1080, C.craie, set1(A('left:120px;top:200px;width:820px;padding:60px;background:rgba(251,248,243,.94);box-shadow:0 30px 60px -30px rgba(0,0,0,.4)', `<div style="font:700 20px/1 ${MA};letter-spacing:.22em;color:${C.bronze}">L’IDÉE REÇUE</div><div style="margin-top:26px;font:400 italic 64px/1.1 ${FR};color:${C.espresso}">« Pas d’impôt sur les sociétés, donc pas d’impôt pour moi. »</div>`)) + lower('02 · PREMIÈRE IMPRESSION', 'Ce que l’on entend souvent'))],
    ['03', 'Le point identifié', box(1920, 1080, C.espresso, TEX.espresso() + A('left:330px;top:120px;transform:rotate(-3deg)', doc(['Société immatriculée : Émirats arabes unis', 'Clients : France, Belgique', 'Décisions prises depuis : Lyon', 'Dirigeant résident fiscal : France', 'Compte bancaire : Dubaï'], 2, 1000)) + lower('03 · LE POINT DE CONTRÔLE', 'Où l’activité est-elle dirigée ?'))],
    ['04', 'Les implications', box(1920, 1080, C.craie, TEX.papier() + T(`left:120px;top:140px;font:700 22px/1 ${MA};letter-spacing:.22em;color:${C.bronze}`, 'CE QUE CELA IMPLIQUE RÉELLEMENT') +
      T(`left:120px;top:220px;width:1100px;font:500 40px/1.35 ${IN};color:${C.espresso}`, ['Le lieu de direction effective peut rattacher la société à un autre pays.', 'La résidence du dirigeant détermine l’imposition de ses revenus.', 'La banque analysera la cohérence de l’ensemble.'].map((l) => `<div style="display:flex;gap:30px;align-items:flex-start;padding:28px 0;border-bottom:2px solid ${C.sable}">${mark('vertical', 10, 60, 'flex:none')}${l}</div>`).join('')) + `<img src="${CUT('studio-marine-reflexion')}" style="position:absolute;right:40px;bottom:0;height:820px;filter:${GRADE}">` + lower('04 · IMPLICATIONS', 'Une décision n’est jamais isolée'))],
    ['05', 'À vérifier', box(1920, 1080, C.grenat, TEX.cuir() + T(`left:120px;top:140px;font:700 22px/1 ${MA};letter-spacing:.22em;color:${C.craie}`, 'À VÉRIFIER AVANT DE DÉCIDER') +
      T(`left:120px;top:230px;width:1200px;font:500 44px/1.35 ${IN};color:${C.ivoire}`, ['Où sont prises les décisions ?', 'Où suis-je résident fiscal ?', 'Quelle substance sur place ?', 'Quelle convention entre les deux pays ?'].map((l, i) => `<div style="display:flex;gap:30px;align-items:center;padding:22px 0"><span style="font:500 60px/1 ${FR};color:${C.sable};width:80px">0${i + 1}</span>${l}</div>`).join('')) +
      T(`left:120px;bottom:90px;font:400 26px/1.4 ${IN};color:${C.craie}`, 'Chaque situation est différente : à analyser avec un professionnel compétent.'))],
  ]
  SB.forEach(([n, , html]) => add(`mockups/point-de-controle/etape-${n}.jpg`, 1920, 1080, html, 1))
  // vertical version of step 3 for Reels
  add('mockups/point-de-controle/etape-03-vertical.jpg', 1080, 1920, box(1080, 1920, C.espresso, TEX.espresso() + A('left:60px;top:480px;transform:rotate(-3deg)', doc(['Société : Émirats arabes unis', 'Clients : France, Belgique', 'Décisions prises depuis : Lyon', 'Dirigeant résident : France'], 2, 900)) +
    T(`left:80px;top:300px;display:flex;align-items:center;gap:18px;padding:16px 26px;background:${C.craie};font:700 22px/1 ${MA};letter-spacing:.22em;color:${C.espresso}`, `${mark('vertical', 8, 26, 'display:block')}LE POINT DE CONTRÔLE`) +
    T(`left:80px;top:1220px;width:920px;font:500 84px/1 ${FR};color:${C.ivoire}`, 'Où l’activité est-elle réellement dirigée ?')), 1)

  /* ---------------- mark animation (5 frames) ---------------- */
  ;[0.0, 0.25, 0.55, 0.85, 1].forEach((p, i) => add(`mockups/red-mark/animation-${i + 1}.jpg`, 900, 340, box(900, 340, C.craie, TEX.papier() +
    T(`left:70px;top:90px;font:500 96px/1 ${FR};color:${C.espresso};letter-spacing:-.02em`, 'les conditions') + markAt('horizontal', 470, 40, p, 'position:absolute;left:250px;top:200px') +
    T(`right:40px;bottom:30px;font:600 18px/1 ${MA};letter-spacing:.2em;color:${C.bronze}`, `${Math.round(p * 600)} ms`)), 1))

  /* ---------------- objects (illustrations of proposed objects) ---------------- */
  const folio = (w, h, open = false) => `<div style="position:relative;width:${w}px;height:${h}px;border-radius:14px;overflow:hidden;box-shadow:0 40px 60px -30px rgba(20,10,5,.7), inset 0 0 0 2px rgba(0,0,0,.15)">${TEX.cuir()}<div style="position:absolute;inset:16px;border:2px dashed rgba(240,213,220,.35);border-radius:9px"></div>${mark('horizontal', w * 0.22, 22, `position:absolute;right:${w * 0.1}px;bottom:${h * 0.1}px;opacity:.55;filter:brightness(1.6) saturate(.6)`, '#E9C8D1')}</div>`
  const pen = (len) => `<svg width="${len}" height="60" viewBox="0 0 ${len} 60"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A4A62"/><stop offset=".45" stop-color="${C.grenat}"/><stop offset="1" stop-color="#3E1322"/></linearGradient><linearGradient id="pm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8D6B8"/><stop offset=".5" stop-color="${C.bronze}"/><stop offset="1" stop-color="#5E4C38"/></linearGradient></defs><path d="M10,30 L60,20 L60,40 Z" fill="url(#pm)"/><rect x="60" y="17" width="${len * 0.62}" height="26" rx="12" fill="url(#pg)"/><rect x="${60 + len * 0.62}" y="17" width="14" height="26" fill="url(#pm)"/><rect x="${74 + len * 0.62}" y="15" width="${len * 0.28}" height="30" rx="14" fill="url(#pg)"/><rect x="${90 + len * 0.62}" y="9" width="${len * 0.2}" height="8" rx="3" fill="url(#pm)"/></svg>`
  const carnet = (w, h) => `<div style="position:relative;width:${w}px;height:${h}px;display:flex;box-shadow:0 30px 50px -25px rgba(20,10,5,.6)">${[0, 1].map((s) => `<div style="position:relative;flex:1;background:#F3ECE1;overflow:hidden;${s ? 'border-left:1px solid #d8ccbb' : ''}">${L.noise({ alpha: 0.04, blend: 'multiply' })}<div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 33px,rgba(155,130,103,.25) 34px)"></div>${s ? `<div style="position:absolute;left:40px;top:60px;font:italic 400 30px/34px 'Instrument Serif';color:#4A4038">Résidence →<br>foyer · activité · intérêts<br><br>Société →<br>lieu de direction ?</div>${mark('horizontal', 210, 18, 'position:absolute;left:36px;top:250px')}${mark('circle', 160, 70, 'position:absolute;left:130px;top:188px')}` : `<div style="position:absolute;left:40px;top:60px;font:italic 400 30px/34px 'Instrument Serif';color:#4A4038">Voir<br>Vérifier<br>Comprendre<br>Décider</div>${mark('vertical', 9, 140, 'position:absolute;left:20px;top:62px')}`}</div>`).join('')}<div style="position:absolute;right:-12px;top:0;bottom:0;width:12px;background:${C.espresso}"></div></div>`
  add('mockups/objets/flat-lay.jpg', 1800, 1100, box(1800, 1100, '#3B2A1E', TEX.bois() + A('left:0;top:0;right:0;bottom:0;background:radial-gradient(80% 70% at 30% 20%,rgba(255,230,200,.18),rgba(0,0,0,.25))') +
    A('left:140px;top:170px;transform:rotate(-6deg)', folio(620, 800)) + A('left:860px;top:260px;transform:rotate(3deg)', carnet(760, 520)) + A('left:900px;top:860px;transform:rotate(-8deg)', pen(560))), 1)
  add('mockups/objets/folio.jpg', 1200, 1000, box(1200, 1000, C.craie, TEX.enduit() + A('left:300px;top:110px;transform:rotate(-4deg)', folio(600, 780))), 1)
  add('mockups/objets/stylo.jpg', 1200, 600, box(1200, 600, C.craie, TEX.papier() + A('left:160px;top:250px;transform:rotate(-6deg)', pen(820)) + mark('annotation', 520, 80, 'position:absolute;left:330px;top:430px')), 1)
  add('mockups/objets/carnet.jpg', 1200, 800, box(1200, 800, C.sable, TEX.enduit(C.sable) + A('left:170px;top:120px;transform:rotate(-2deg)', carnet(860, 560))), 1)
  // the signature gesture, 4 frames
  const g = (i) => box(1200, 800, '#3B2A1E', TEX.bois() + A('left:200px;top:90px;transform:rotate(-2deg)', doc(['Société immatriculée à l’étranger', 'Décisions prises depuis : Lyon', 'Dirigeant résident : France', 'Compte bancaire : Dubaï'], i >= 2 ? 1 : -1, 800).replace(i === 2 ? 'xx' : 'yy', '')) + (i === 1 ? A('left:380px;top:250px;width:420px;height:60px;border-radius:30px;box-shadow:0 0 0 4px rgba(231,222,210,.7)') : '') + (i >= 1 ? A(`left:${i === 1 ? 760 : 820}px;top:${i === 1 ? 420 : 300}px;transform:rotate(-24deg)`, pen(420)) : '') + (i === 3 ? T(`left:200px;bottom:60px;padding:18px 26px;background:${C.craie};font:500 34px/1 ${FR};color:${C.espresso}`, 'Ce détail change la lecture du dossier.') : ''))
  ;[0, 1, 2, 3].forEach((i) => add(`mockups/geste/geste-${i + 1}.jpg`, 1200, 800, g(i), 1))

  /* ---------------- decor (photomontage simulations) ---------------- */
  const sculpt = (x, y, s = 1) => A(`left:${x}px;top:${y}px;width:${120 * s}px;height:${180 * s}px`, `<div style="position:absolute;left:${20 * s}px;bottom:0;width:${80 * s}px;height:${110 * s}px;border-radius:${40 * s}px ${40 * s}px ${6 * s}px ${6 * s}px;background:radial-gradient(70% 60% at 35% 25%,#F4EDE2,#C9BBA7 60%,#8E7E6A)"></div><div style="position:absolute;left:${36 * s}px;bottom:${105 * s}px;width:${48 * s}px;height:${66 * s}px;border-radius:50%;background:radial-gradient(70% 60% at 35% 25%,#F4EDE2,#C9BBA7 60%,#8E7E6A)"></div>`)
  const books = (x, y) => A(`left:${x}px;top:${y}px;display:flex;align-items:flex-end;gap:5px`, [[C.grenat, 180], ['#CDBFAE', 156], [C.espresso, 168], ['#E2D7C8', 148]].map(([c, h]) => `<div style="width:38px;height:${h}px;background:${c};box-shadow:inset -3px 0 0 rgba(0,0,0,.12)"></div>`).join(''))
  const decor = (w, h, dark = false, vertical = false) => {
    const deskH = vertical ? 520 : 230
    const wall = dark ? TEX.murBrun() + A(`inset:0;background:radial-gradient(60% 70% at ${vertical ? 50 : 62}% 35%,rgba(255,220,180,.22),rgba(0,0,0,.45))`) : TEX.enduit() + A(`inset:0;background:linear-gradient(${vertical ? 180 : 90}deg,rgba(255,240,220,.45) 0%,rgba(255,240,220,0) 40%,rgba(48,40,32,.28) 100%)`)
    const cutH = vertical ? 1150 : 860
    return box(w, h, dark ? '#3A2E25' : C.craie, wall +
      (vertical ? '' : sculpt(200, h - deskH - 290, 1.6) + books(w - 460, h - deskH - 180)) +
      `<img src="${CUT(dark ? 'studio-marine-reflexion' : 'studio-marine')}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:${deskH - 40}px;height:${cutH}px;filter:${GRADE} ${dark ? 'brightness(.92) contrast(1.1)' : ''} drop-shadow(-30px 20px 40px rgba(20,12,6,.4))">` +
      A(`left:0;right:0;bottom:0;height:${deskH}px`, TEX.bois() + A('left:0;right:0;top:0;height:8px;background:rgba(255,226,190,.25)')) +
      A(`left:${vertical ? 120 : w / 2 - 420}px;bottom:${deskH - 30}px;transform:perspective(600px) rotateX(55deg) rotate(-8deg)`, folio(vertical ? 260 : 220, vertical ? 330 : 280)) +
      A(`left:${vertical ? 620 : w / 2 + 230}px;bottom:${deskH - 20}px;transform:perspective(600px) rotateX(60deg) rotate(6deg)`, carnet(vertical ? 320 : 280, vertical ? 210 : 180)))
  }
  add('mockups/decor/decor-principal-face.jpg', 1920, 1080, decor(1920, 1080), 1)
  add('mockups/decor/decor-principal-vertical.jpg', 1080, 1920, decor(1080, 1920, false, true), 1)
  add('mockups/decor/decor-sombre-face.jpg', 1920, 1080, decor(1920, 1080, true), 1)
  add('mockups/decor/decor-sombre-vertical.jpg', 1080, 1920, decor(1080, 1920, true, true), 1)

  /* ---------------- Executive Signature silhouette placeholder ---------------- */
  add('mockups/silhouettes/executive-signature-a-photographier.jpg', 900, 1200, box(900, 1200, C.craie, TEX.enduit() + A(`left:90px;top:90px;right:90px;bottom:90px;border:3px dashed ${C.bronze};border-radius:16px;background:repeating-linear-gradient(45deg,rgba(155,130,103,.07) 0 22px,transparent 22px 44px)`) +
    T(`left:0;right:0;top:420px;text-align:center;font:700 26px/1.5 ${MA};letter-spacing:.2em;color:${C.espresso}`, 'PHOTO À RÉALISER') +
    T(`left:150px;right:150px;top:520px;text-align:center;font:400 28px/1.5 ${IN};color:${C.espresso}`, 'Veste espresso, haut crème, folio grenat en main. Décor principal, lumière latérale.') +
    A('left:330px;top:760px;display:flex;gap:16px', [C.espresso, C.ivoire, C.grenat, C.bronze].map((c) => `<div style="width:50px;height:50px;border-radius:50%;background:${c};box-shadow:0 0 0 2px #fff"></div>`).join(''))), 1)

  /* expose for the render script */
  const host = document.getElementById('v')
  host.innerHTML = items.map((it, i) => `<div data-out="${it.out}" data-scale="${it.scale}" style="width:${it.w}px;height:${it.h}px;margin:0 0 20px">${it.html}</div>`).join('')
  window.SB = SB.map(([n, t]) => ({ n, t }))
  document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {})))).then(() => (document.body.dataset.ready = '1'))
})()
