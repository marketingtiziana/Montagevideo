/* Reference-inspired grammar (V2): tonal monochrome photos, condensed capitals, script accents,
   "émission" labels. Same system for the four directions; only the tone (palette) and the small sign change.
   Loaded after identite.js: it overrides the post / slide / reel / banner builders. */
;(function () {
  const E = window.ENG, L = window.LIB, { A, T, box } = E, full = E.full
  const TONE = {
    '01': { f: 'grayscale(.5) sepia(.55) saturate(.95) contrast(.96) brightness(1.04)', tint: '#B8957A', op: 0.32, l1: '#E8D9C7', l2: '#CDB49B', d1: '#B39579', d2: '#94765D', ink: '#4A372B', soft: '#7A604C', script: '#5A4334' },
    '02': { f: 'grayscale(1) sepia(.16) contrast(1.03) brightness(1.05)', tint: '#A9A39A', op: 0.12, l1: '#EFEDE8', l2: '#D8D4CC', d1: '#4A4744', d2: '#2A2826', ink: '#242321', soft: '#6E6A64', script: '#3A3835' },
    '03': { f: 'grayscale(.6) sepia(.38) saturate(.85) contrast(.97) brightness(1.04)', tint: '#8E9175', op: 0.3, l1: '#E8E4D6', l2: '#CFC7B1', d1: '#7E8369', d2: '#5E634C', ink: '#3E3A2E', soft: '#6D7259', script: '#4A4A38' },
    '04': { f: 'grayscale(.55) sepia(.4) saturate(.9) contrast(.98) brightness(1.03)', tint: '#8C6378', op: 0.26, l1: '#EEE3D9', l2: '#D8C5B8', d1: '#6B4661', d2: '#49283F', ink: '#3A2632', soft: '#7D6070', script: '#49283F' },
  }
  for (const d of window.DIRS) {
    const t = (d.tone = TONE[d.id])
    d.grade = { f: t.f, overlay: `background:${t.tint};mix-blend-mode:color;opacity:${t.op}` }
    if (d.gradeAlt) d.gradeAlt = { f: 'saturate(.7) sepia(.2) brightness(1.03)' }
    d.fonts = { ...d.fonts, title: "'Bebas Neue'", tw: 400, italic: false, script: 'Allura', spec: 'Bebas Neue (titres condensés) · Allura (accent manuscrit) · Manrope 500 / 700 (texte, labels)' }
    d.gradients = [`radial-gradient(110% 85% at 50% 30%,${t.l1},${t.l2})`, `linear-gradient(180deg,${t.l1},${t.d1})`, `radial-gradient(110% 85% at 50% 30%,${t.d1},${t.d2})`]
    d.treatment = 'Monochrome tonal : photo désaturée puis teintée dans la palette, comme une seule pellicule ; contraste doux, peau naturelle.'
  }
  const ph = (d, k, css, pos = '50% 25%', alt = false) => E.photo(d, k, css, pos, alt)
  const W = '#FFFFFF'
  const big = (t, size, c, css = '', lh = 0.92) => T(`${css};font:400 ${size}px/${lh} 'Bebas Neue';letter-spacing:.005em;color:${c}`, t)
  const scr = (t, size, c, css = '') => T(`${css};font:400 ${size}px/1 Allura;color:${c}`, t)
  const sm = (t, size, c, css = '', w = 700) => T(`${css};font:${w} ${size}px/1.25 Manrope;letter-spacing:.06em;text-transform:uppercase;color:${c}`, t)
  const body = (t, size, c, css = '') => T(`${css};font:500 ${size}px/1.45 Manrope;color:${c}`, t)
  const swoosh = (c, css, w = 420) => A(css, `<svg width="${w}" height="40" viewBox="0 0 420 40"><path d="M6 30 C 120 8, 300 6, 414 22" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`)
  const show = (d, c, css) => A(`${css};text-align:center`, `<div style="display:inline-block;position:relative;padding:14px 26px 10px;font:400 72px/.88 'Bebas Neue';color:${c}"><span style="position:absolute;left:0;top:0;bottom:0;width:18px;border:3px solid ${c};border-right:0"></span><span style="position:absolute;right:0;top:0;bottom:0;width:18px;border:3px solid ${c};border-left:0"></span>THE REALITY<br>BEHIND BUSINESS<div style="font:700 17px Manrope;letter-spacing:.12em;margin-top:6px">L’ÉMISSION</div></div>`)
  const pill = (t, bg, c, css) => T(`${css};padding:12px 30px 6px;background:${bg};border-radius:18px;transform:rotate(-3deg);font:italic 400 64px/1 'Bebas Neue';color:${c}`, t)
  const tonal = (d, dark = false) => `<div style="${full}background:${d.gradients[dark ? 2 : 0]}"></div>` + L.noise({ alpha: 0.035, blend: 'multiply' }) + A(`inset:0;background:radial-gradient(120% 90% at 50% 40%,rgba(255,255,255,0) 55%,rgba(0,0,0,${dark ? 0.22 : 0.1}))`)
  const fadeB = (d, a = 0.75, from = 45) => A(`inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) ${from}%,${d.tone.d2}${Math.round(a * 255).toString(16).padStart(2, '0')})`)
  const fadeT = (d, from = 40) => A(`inset:0;background:linear-gradient(0deg,rgba(0,0,0,0) ${from}%,${d.tone.l1}EE)`)
  // signature: the same script name for all four + the small sign of each direction
  const mark = (d, c, css = 'left:80px;bottom:70px', size = 90) => {
    const acc = { '01': '', '02': `<div style="width:${size * 0.9}px;height:2px;background:${c};margin-top:6px"></div>`, '03': `<span style="display:inline-block;width:${size * 0.24}px;height:${size * 0.18}px;margin-left:10px;border-radius:55% 45% 50% 50%/60% 55% 45% 40%;background:${d.pal.accent}"></span>`, '04': `<span style="display:inline-block;width:${size * 0.13}px;height:${size * 0.13}px;margin-left:4px;border-radius:50%;background:${c === W || c.startsWith('rgba(255') ? '#D9C7BD' : d.pal.accent}"></span>` }[d.id]
    return A(css, `<div style="font:400 ${size}px/1 Allura;color:${c};white-space:nowrap">Tiziana${d.id === '01' ? '.' : ''}${d.id === '02' ? '' : acc}</div>${d.id === '02' ? acc : ''}`)
  }
  window.MARK = mark

  window.POST = (d, i) => {
    const t = d.tone
    switch (i) {
      case 0: return box(1080, 1440, t.d2, ph(d, 'studio-marine', 'inset:0', '50% 16%') + T(`left:70px;top:80px;font:400 46px 'Cormorant Garamond';color:${W};opacity:.9`, 'The reality behind business.') + mark(d, W, 'right:70px;bottom:60px', 80))
      case 1: return box(1080, 1440, t.l1, tonal(d) + big('Je préfère<br>comprendre<br>le problème', 168, t.ink, 'left:0;right:0;top:360px;text-align:center') + sm('avant de chercher', 34, t.ink, 'left:0;right:0;top:900px;text-align:center') + scr('la solution.', 150, t.script, 'left:0;right:0;top:970px;text-align:center'))
      case 2: return box(1080, 1920, t.d2, ph(d, 'balcon-telephone', 'inset:0', '50% 20%') + fadeB(d, 0.85, 40) + sm('Reel', 26, W, 'left:80px;top:300px;padding:10px 22px 8px;border:2px solid #fff;border-radius:30px') + big('Résidence fiscale', 170, W, 'left:0;right:0;top:1150px;text-align:center') + scr('ce que l’adresse ne prouve pas', 92, W, 'left:0;right:0;top:1330px;text-align:center'))
      case 3: return box(1080, 1440, t.d2, ph(d, 'bibliotheque-ordinateur', 'inset:0', '40% 35%'))
      case 4: return box(1080, 1440, t.l1, tonal(d) + A('right:-40px;bottom:0;width:640px;height:780px;overflow:hidden', ph(d, 'bibliotheque-sourire', 'inset:0', '50% 25%') + A(`inset:0;background:linear-gradient(90deg,${t.l2} 0%,rgba(0,0,0,0) 40%),linear-gradient(0deg,rgba(0,0,0,0) 70%,${t.l1} 100%)`)) + show(d, t.ink, 'left:0;right:0;top:110px') + pill('Carrousel · banque', t.ink, t.l1, 'left:90px;top:470px') + big('5 questions<br>avant de choisir<br>sa banque<br>à l’étranger', 120, t.ink, 'left:90px;top:610px;width:620px;font-style:italic') + swoosh(t.ink, 'left:90px;top:1300px', 360))
      case 5: return box(1080, 1440, t.d2, ph(d, 'fenetre-ronde-ordinateur', 'inset:0', '50% 40%', d.id === '02'))
      case 6: return box(1080, 1440, t.d1, tonal(d, true) + big('Une structure<br>doit servir<br>un projet', 176, W, 'left:0;right:0;top:400px;text-align:center') + body('pas l’inverse.', 46, W, 'left:0;right:0;top:960px;text-align:center') + mark(d, 'rgba(255,255,255,.92)', 'left:0;right:0;top:1100px;text-align:center;display:flex;flex-direction:column;align-items:center', 130))
      case 7: return box(1080, 1440, t.d2, ph(d, 'dejeuner-affaires', 'inset:0', '50% 30%', d.id === '02') + T(`left:0;right:0;top:640px;text-align:center;font:400 78px 'Cormorant Garamond';letter-spacing:.04em;color:rgba(255,255,255,.72);text-transform:uppercase`, 'Entre deux rendez-vous'))
      case 8: return box(1080, 1440, t.l1, tonal(d) + sm('Actualité · 1er septembre 2026', 26, t.soft, 'left:0;right:0;top:200px;text-align:center') + big('Factures<br>électroniques', 196, t.ink, 'left:0;right:0;top:340px;text-align:center') + sm('ce qui a changé pour les entreprises', 32, t.ink, 'left:0;right:0;top:740px;text-align:center') + scr('On en parle ?', 140, t.script, 'left:0;right:0;top:820px;text-align:center') + body('Réception obligatoire pour toutes les entreprises ; émission pour les PME au 1<sup>er</sup> septembre 2027.', 26, t.ink, 'left:170px;right:170px;top:1110px;text-align:center') + sm('Source : impots.gouv.fr', 18, t.soft, 'left:0;right:0;bottom:80px;text-align:center', 600))
      case 9: return box(1080, 1440, t.d2, ph(d, 'voyage-valise-fenetre', 'inset:0', '50% 40%', d.id === '02') + fadeB(d, 0.55, 65) + scr('En déplacement.', 110, W, 'left:80px;bottom:90px'))
      case 10: return box(1080, 1440, t.d2, ph(d, 'table-reflexion', 'inset:0', '50% 25%') + A(`inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,${t.d2}cc 62%,${t.d2}cc 80%,rgba(0,0,0,0) 100%)`) + sm('Réflexion', 22, W, 'left:0;right:0;top:830px;text-align:center') + big('“Ce qui est adapté à un entrepreneur<br>ne l’est pas nécessairement<br>à un autre.”', 82, W, 'left:40px;right:40px;top:880px;text-align:center'))
      case 11: return box(1080, 1440, t.d2, ph(d, 'studio-marine-reflexion', 'inset:0', '50% 18%') + fadeB(d, 0.6, 55) + T(`left:0;right:0;top:860px;text-align:center;font:400 120px 'Cormorant Garamond';letter-spacing:.02em;color:${W}`, 'THE REALITY') + scr('behind business', 150, W, 'left:0;right:0;top:980px;text-align:center;transform:rotate(-4deg)'))
    }
  }
  window.SLIDE = (d, j) => {
    const t = d.tone, S = [['01', 'Quels flux,<br>quelles devises ?', 'Vos besoins réels — clients, fournisseurs, pays — déterminent le type d’établissement adapté.'], ['02', 'Où êtes-vous résident,<br>où est la société ?', 'Les établissements regardent la cohérence entre votre résidence, la société et l’activité.'], ['03', 'Pouvez-vous documenter<br>votre activité ?', 'Contrats, factures, origine des fonds : la conformité fait partie de l’ouverture.']]
    if (j === 3) return box(1080, 1440, t.d1, tonal(d, true) + sm('À retenir', 26, 'rgba(255,255,255,.8)', 'left:0;right:0;top:300px;text-align:center') + big('Une solution bancaire<br>se choisit à partir de', 120, W, 'left:0;right:0;top:420px;text-align:center') + scr('votre situation.', 140, W, 'left:0;right:0;top:700px;text-align:center') + body('Chaque situation est différente : à analyser avec un professionnel compétent.', 28, 'rgba(255,255,255,.85)', 'left:180px;right:180px;top:960px;text-align:center') + mark(d, 'rgba(255,255,255,.9)', 'left:0;right:0;bottom:90px;display:flex;justify-content:center', 90))
    const [n, ti, b] = S[j]
    return box(1080, 1440, t.l1, tonal(d) + big(n, 300, t.l2, 'left:0;right:0;top:120px;text-align:center', 1) + big(ti, 128, t.ink, 'left:60px;right:60px;top:520px;text-align:center') + swoosh(t.ink, 'left:330px;top:820px', 420) + body(b, 32, t.ink, 'left:150px;right:150px;top:900px;text-align:center') + sm(`${j + 2} / 5`, 22, t.soft, 'right:90px;bottom:90px', 600))
  }
  window.EXTRA_REELS = (d, k) => box(1080, 1920, d.tone.d2, ph(d, ['voyage-valise', 'fenetre-ronde-lecture'][k], 'inset:0', '50% 30%', d.id === '02') + fadeB(d, 0.85, 40) + sm('Reel', 26, W, 'left:80px;top:300px;padding:10px 22px 8px;border:2px solid #fff;border-radius:30px') + big(['Avant de partir', 'Ce que la banque'][k], 170, W, 'left:0;right:0;top:1150px;text-align:center') + scr(['trois questions', 'vérifie vraiment'][k], 120, W, 'left:0;right:0;top:1320px;text-align:center'))
  window.BANNER = (d, w = 1584, h = 396) => { const t = d.tone; return box(w, h, t.l1, tonal(d) + A(`right:0;top:0;width:${w * 0.42}px;height:${h}px;overflow:hidden`, ph(d, 'bibliotheque-sourire', 'inset:0', '50% 22%') + A(`inset:0;background:linear-gradient(90deg,${t.l1} 0%,rgba(0,0,0,0) 45%)`)) + big('The reality', h * 0.3, t.ink, `left:${w * 0.3}px;top:${h * 0.2}px`) + scr('behind business', h * 0.24, t.script, `left:${w * 0.34}px;top:${h * 0.47}px`) + sm('Tiziana Caci · Fondatrice & directrice de Fynovates', h * 0.042, t.soft, `left:${w * 0.3}px;top:${h * 0.8}px`, 600)) }
  window.AVATAR = (d) => box(800, 800, d.tone.l1, ph(d, 'studio-marine', 'left:-60px;top:-30px;width:920px;height:1230px', '50% 12%'))
  window.HL = (d, k) => { const t = d.tone; return box(300, 300, [t.l1, t.d1, t.l2][k], k === 0 ? ph(d, 'bibliotheque-sourire', 'inset:0', '50% 25%') : tonal(d, k === 1) + A('inset:0;display:flex;align-items:center;justify-content:center', k === 1 ? `<div style="font:400 120px/1 Allura;color:#fff">T</div>` : `<div style="font:400 96px/1 'Bebas Neue';color:${t.ink}">TRB</div>`)) }
})()
