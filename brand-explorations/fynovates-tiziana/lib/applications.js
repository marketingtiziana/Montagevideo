/* Application mockups at native size (px). Fynovates: texture × support. Tiziana: direction × support. */
;(function () {
  const IMG = 'lib/img/'
  const WM_W = IMG + 'fynovates-logo-white.svg'
  const WM_N = IMG + 'fynovates-logo-navy.svg'
  const wm = (w, tone = 'w', extra = '') => `<img src="${tone === 'w' ? WM_W : WM_N}" alt="FYNOVATES" style="display:block;width:${w}px;height:auto;${extra}">`
  const abs = (css, inner = '') => `<div style="position:absolute;${css}">${inner}</div>`
  const caps = (size, color, ls = 0.2, weight = 600, font = 'Inter') => `font-family:'${font}';font-size:${size}px;font-weight:${weight};letter-spacing:${ls}em;text-transform:uppercase;color:${color}`

  /* ------------------------------ FYNOVATES ------------------------------ */
  const FN_APPS = [
    { key: 'li', label: 'Bannière LinkedIn', w: 1128, h: 191 },
    { key: 'yt', label: 'Miniature YouTube', w: 1280, h: 720 },
    { key: 'ig', label: 'Visuel pédagogique Instagram', w: 1080, h: 1350 },
    { key: 'cover', label: 'Couverture de présentation', w: 1920, h: 1080 },
    { key: 'post', label: 'Fond de publication corporate', w: 1080, h: 1080 },
    { key: 'slide', label: 'Slide d’expertise', w: 1920, h: 1080 },
  ]
  const W72 = 'rgba(255,255,255,0.72)'
  const W40 = 'rgba(255,255,255,0.4)'
  const W18 = 'rgba(255,255,255,0.18)'

  function fnInner(key, w, h) {
    if (key === 'li')
      return abs(
        `left:240px;right:56px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right`,
        wm(250) +
          `<div style="margin-top:18px;font-size:22px;font-weight:500;white-space:nowrap">Le cabinet de conseil des entrepreneurs en ligne et internationaux.</div>` +
          `<div style="margin-top:14px;${caps(11.5, W72)}">Fiscalité &nbsp;|&nbsp; Banque &nbsp;|&nbsp; Expatriation &nbsp;|&nbsp; Structuration internationale</div>`,
      )
    if (key === 'yt')
      return abs(
        `left:80px;top:70px;right:80px;bottom:70px;display:flex;flex-direction:column`,
        `<div style="display:flex;align-items:center;gap:22px">${wm(210)}<span style="width:2px;height:22px;background:${W40}"></span><span style="${caps(22, W72)}">Fiscalité</span></div>` +
          `<div style="margin-top:auto;font-size:104px;font-weight:800;line-height:1;letter-spacing:-0.02em;text-transform:uppercase">Résidence<br>fiscale</div>` +
          `<div style="margin-top:30px;width:80px;height:4px;background:#fff"></div><div style="margin-top:26px;font-size:36px;font-weight:500;color:${W72}">Les erreurs à éviter</div>`,
      )
    if (key === 'ig')
      return abs(
        `left:84px;top:84px;right:84px;bottom:84px;display:flex;flex-direction:column`,
        `<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:28px;border-bottom:1.5px solid ${W18}">${wm(230)}<span style="${caps(22, W72)}">Guide</span></div>` +
          `<div style="margin-top:70px;font-size:70px;font-weight:700;line-height:1.06;letter-spacing:-0.015em">Trois questions avant de facturer à l’international</div>` +
          `<div style="margin-top:64px">${['Où sont réellement vos clients ?', 'Quel régime de TVA s’applique ?', 'Où l’activité est-elle dirigée ?']
            .map((x, i) => `<div style="display:flex;gap:30px;align-items:baseline;padding:30px 0;border-top:1.5px solid ${W18}"><span style="${caps(26, W40, 0.12)}">0${i + 1}</span><span style="font-size:40px;font-weight:600">${x}</span></div>`)
            .join('')}</div>` +
          `<div style="margin-top:auto;display:flex;justify-content:space-between;font-size:22px;color:${W40}"><span>Information générale</span><span>fynovates.com</span></div>`,
      )
    if (key === 'cover')
      return abs(
        `left:140px;top:120px;right:140px;bottom:120px;display:flex;flex-direction:column`,
        wm(360) +
          `<div style="margin-top:auto;${caps(24, W72, 0.24)}">Document de présentation</div>` +
          `<div style="margin-top:28px;font-size:120px;font-weight:700;line-height:1.02;letter-spacing:-0.02em">Structuration<br>internationale</div>` +
          `<div style="margin-top:44px;width:120px;height:3px;background:#fff"></div><div style="margin-top:36px;font-size:34px;color:${W72}">Comprendre avant de décider : la méthode du cabinet</div>`,
      )
    if (key === 'post')
      return abs(
        `left:96px;top:96px;right:96px;bottom:96px;display:flex;flex-direction:column`,
        wm(240) +
          `<div style="margin-top:auto;font-size:78px;font-weight:700;line-height:1.08;letter-spacing:-0.015em">Comprendre,<br>vérifier, faire relire,<br>recommander.</div>` +
          `<div style="margin-top:40px;width:80px;height:3px;background:#fff"></div><div style="margin-top:30px;font-size:30px;color:${W72}">La méthode Fynovates</div>`,
      )
    // slide
    return abs(
      `left:120px;top:110px;right:120px;bottom:110px;display:grid;grid-template-columns:0.9fr 1.1fr;gap:110px`,
      `<div style="display:flex;flex-direction:column">${wm(260)}<div style="margin-top:auto;${caps(22, W72, 0.24)}">Expertises</div><div style="margin-top:24px;font-size:84px;font-weight:700;line-height:1.04;letter-spacing:-0.02em">Nos domaines d’intervention</div><div style="margin-top:34px;font-size:28px;line-height:1.4;color:${W72}">Une lecture transversale de la situation de l’entrepreneur.</div></div>` +
        `<div style="display:grid;grid-template-columns:1fr 1fr;align-content:center;border-top:1.5px solid ${W18};border-left:1.5px solid ${W18}">${[
          ['01', 'Fiscalité et structuration internationale'],
          ['02', 'Comptabilité et obligations administratives'],
          ['03', 'Banque et solutions de paiement'],
          ['04', 'Expatriation et mobilité internationale'],
        ]
          .map(([n, t]) => `<div style="padding:44px 40px;min-height:230px;border-right:1.5px solid ${W18};border-bottom:1.5px solid ${W18}"><div style="${caps(22, W40, 0.14)}">${n}</div><div style="margin-top:22px;font-size:38px;font-weight:600;line-height:1.2">${t}</div></div>`)
          .join('')}</div>`,
    )
  }

  function fnMock(t, app) {
    return `<div class="native" style="width:${app.w}px;height:${app.h}px;position:relative;overflow:hidden;font-family:'Inter';color:#fff">${t.layer(app.w, app.h)}${fnInner(app.key, app.w, app.h)}</div>`
  }

  /* ------------------------------ TIZIANA ------------------------------ */
  const TZ_APPS = [
    { key: 'li', label: 'Bannière LinkedIn personnelle', w: 1584, h: 396 },
    { key: 'yt', label: 'Miniature YouTube avec Tiziana', w: 1280, h: 720 },
    { key: 'ig', label: 'Post Instagram (photo seule)', w: 1080, h: 1350 },
    { key: 'carousel', label: 'Couverture de carrousel', w: 1080, h: 1350 },
    { key: 'quote', label: 'Citation / prise de position', w: 1080, h: 1080 },
    { key: 'cover', label: 'Couverture de présentation', w: 1920, h: 1080 },
  ]
  const photo = (n, css) => `<img src="${IMG}tz-${n}.jpg" alt="Photographie de Tiziana (shooting studio)" style="position:absolute;object-fit:cover;object-position:center top;${css}">`
  const display = (d, size, color, extra = '') =>
    `font-family:'${d.fonts.display}';font-weight:${d.fonts.dWeight};font-size:${size}px;line-height:1.02;color:${color};${d.fonts.italic ? '' : ''}${extra}`
  const text = (d, size, color, extra = '') => `font-family:'${d.fonts.text}';font-size:${size}px;color:${color};${extra}`
  const kick = (d, size, color, ls = 0.22) => caps(size, color, ls, 600, d.fonts.caps)

  /* signature line that ties Tiziana to Fynovates without using the corporate identity */
  const signature = (d, size) => `<span style="${kick(d, size, d.c.muted, 0.2)}">Fondatrice &amp; directrice de Fynovates</span>`

  function deco(d, w, h) {
    const c = d.c
    if (d.key === 'champagne') return abs(`inset:${Math.round(h * 0.05)}px;border:1.5px solid ${c.line};outline:1px solid ${c.line};outline-offset:-10px`)
    if (d.key === 'noir') return abs(`left:0;right:0;top:${Math.round(h * 0.06)}px;height:${Math.max(3, Math.round(h * 0.006))}px;background:${c.ink}`)
    if (d.key === 'brown') return abs(`left:0;top:0;bottom:0;width:${Math.round(w * 0.035)}px;background:${c.accent}`)
    if (d.key === 'archi') return abs(`left:${Math.round(w * 0.06)}px;bottom:${Math.round(h * 0.09)}px;width:${Math.round(w * 0.12)}px;height:3px;background:${c.bridge}`)
    return ''
  }

  function tzInner(d, key, w, h) {
    const c = d.c
    const ital = d.fonts.serif ? `font-family:'${d.fonts.serif}';font-style:italic;font-weight:400` : d.fonts.italic ? 'font-style:italic' : ''
    if (key === 'li') {
      return (
        abs(
          `right:110px;top:0;bottom:0;width:820px;display:flex;flex-direction:column;justify-content:center`,
          `<div style="${kick(d, 15, c.muted)}">Tiziana Caci</div>` +
            `<div style="margin-top:18px;${display(d, d.key === 'noir' ? 54 : 58, c.ink)}">Avant de choisir une structure, <span style="${ital}">il faut comprendre la situation.</span></div>` +
            `<div style="margin-top:24px;display:flex;align-items:center;gap:16px"><span style="width:44px;height:${d.key === 'noir' ? 3 : 1.5}px;background:${d.key === 'archi' ? c.bridge : c.ink}"></span>${signature(d, 13)}</div>`,
        ) + deco(d, w, h)
      )
    }
    if (key === 'yt') {
      const pw = 520
      const frame = d.key === 'editorial' || d.key === 'champagne' ? `right:60px;top:60px;width:${pw - 60}px;height:${h - 120}px;` : `right:0;top:0;width:${pw}px;height:${h}px;`
      return (
        (d.key === 'brown' ? abs(`right:0;top:0;width:${pw}px;height:${h}px;background:${c.accent}`) : '') +
        photo(d.key === 'noir' ? 1 : d.key === 'brown' ? 2 : d.key === 'sand' ? 3 : d.key === 'archi' ? 4 : 2, frame) +
        abs(
          `left:76px;top:66px;right:${pw + 60}px;bottom:66px;display:flex;flex-direction:column`,
          `<div style="${kick(d, 20, c.muted)}">Tiziana Caci · Le point de vue</div>` +
            `<div style="margin-top:auto;${display(d, d.key === 'noir' || d.key === 'brown' ? 80 : 86, c.ink, 'letter-spacing:-0.01em')}">Partir, <span style="${ital}">oui.</span><br>Mais pourquoi ?</div>` +
            `<div style="margin-top:28px;width:70px;height:${d.key === 'noir' ? 5 : 2}px;background:${d.key === 'archi' ? c.bridge : c.ink}"></div>` +
            `<div style="margin-top:24px;${text(d, 30, c.muted)}">Ce qu’il faut comprendre avant de s’expatrier</div>`,
        ) +
        deco(d, w, h)
      )
    }
    if (key === 'ig') {
      // Tiziana's feed rule: photographs only, no text
      const m = d.key === 'noir' || d.key === 'brown' ? 0 : 70
      return photo(d.key === 'sand' ? 2 : d.key === 'champagne' ? 4 : d.key === 'archi' ? 1 : 3, `left:${m}px;top:${m}px;width:${w - 2 * m}px;height:${h - 2 * m}px;`) + (d.key === 'champagne' ? abs(`left:${m - 14}px;top:${m - 14}px;right:${m - 14}px;bottom:${m - 14}px;border:1.5px solid ${c.line}`) : '')
    }
    if (key === 'carousel') {
      return (
        abs(
          `left:96px;top:110px;right:96px;bottom:96px;display:flex;flex-direction:column`,
          `<div style="display:flex;justify-content:space-between">${`<span style="${kick(d, 20, c.muted)}">Ce que je constate sur le terrain</span>`}<span style="${kick(d, 20, c.muted)}">1 / 6</span></div>` +
            `<div style="margin-top:120px;${display(d, d.key === 'noir' ? 112 : 118, c.ink, 'letter-spacing:-0.015em')}">On choisit<br>le pays avant<br><span style="${ital}">de comprendre</span><br>l’activité.</div>` +
            `<div style="margin-top:auto;display:flex;align-items:center;gap:20px"><span style="width:60px;height:${d.key === 'noir' ? 4 : 2}px;background:${d.key === 'archi' ? c.bridge : c.ink}"></span><span style="${kick(d, 20, c.ink, 0.18)}">Tiziana Caci</span></div>`,
        ) + deco(d, w, h)
      )
    }
    if (key === 'quote') {
      return (
        abs(
          `left:110px;top:110px;right:110px;bottom:110px;display:flex;flex-direction:column;justify-content:center`,
          `<div style="${display(d, 200, d.key === 'champagne' ? c.accent : c.line, 'line-height:0.6;height:90px')}">“</div>` +
            `<div style="${display(d, d.key === 'noir' ? 78 : 84, c.ink, 'line-height:1.08')}">Une structure doit servir un projet, <span style="${ital}">pas l’inverse.</span></div>` +
            `<div style="margin-top:56px;display:flex;align-items:center;gap:18px"><span style="width:50px;height:${d.key === 'noir' ? 4 : 1.5}px;background:${d.key === 'archi' ? c.bridge : c.ink}"></span><span style="${kick(d, 20, c.ink, 0.18)}">Tiziana Caci</span></div>` +
            `<div style="margin-top:12px;margin-left:68px">${signature(d, 16)}</div>`,
        ) + deco(d, w, h)
      )
    }
    // cover
    return (
      photo(d.key === 'noir' ? 4 : d.key === 'brown' ? 3 : 1, d.key === 'editorial' || d.key === 'champagne' ? `right:120px;top:120px;width:620px;height:${h - 240}px;` : `right:0;top:0;width:760px;height:${h}px;`) +
      abs(
        `left:130px;top:120px;width:${d.key === 'editorial' || d.key === 'champagne' ? 940 : 900}px;bottom:120px;display:flex;flex-direction:column`,
        `<div style="${kick(d, 22, c.muted)}">Intervention · Présentation personnelle</div>` +
          `<div style="margin-top:auto;${display(d, 136, c.ink, 'letter-spacing:-0.02em')}">Tiziana<br><span style="${ital}">Caci</span></div>` +
          `<div style="margin-top:40px;width:110px;height:${d.key === 'noir' ? 5 : 2}px;background:${d.key === 'archi' ? c.bridge : c.ink}"></div>` +
          `<div style="margin-top:34px;${text(d, 34, c.ink)}">Entreprendre à l’international : comprendre avant de décider</div>` +
          `<div style="margin-top:18px">${signature(d, 18)}</div>`,
      ) +
      deco(d, w, h)
    )
  }

  function tzMock(d, app) {
    return `<div class="native" style="width:${app.w}px;height:${app.h}px;position:relative;overflow:hidden;font-family:'${d.fonts.text}'">${d.bgLayer(d.c, app.w, app.h)}${tzInner(d, app.key, app.w, app.h)}</div>`
  }

  window.APPS = { FN_APPS, TZ_APPS, fnMock, tzMock, wm, WM_N, WM_W }
})()
