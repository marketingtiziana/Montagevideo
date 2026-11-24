// Les 10 infographies FYNOVATES (1080 × 1350). Chaque composition suit une logique propre :
// arbre de décision, jauge à seuil, tableau 3 colonnes, flux horizontal, cascade, deux espaces,
// dossier central, timeline-checklist, schéma d'analyse convergent, grille de diagnostic.
import { frame, title, fix, K, RES } from './style.mjs';
const f = fix;

// ———————————————————— 01 · ARBRE DE DÉCISION TVA
const q = (n, t, sub = '') => `<div class="box" style="display:flex;align-items:center;gap:20px;padding:13px 22px;position:relative;z-index:1">
  <span class="n" style="flex:none;width:44px;height:44px;border-radius:50%;background:${K.navy};color:#fff;font-weight:600;font-size:22px;display:flex;align-items:center;justify-content:center">${n}</span>
  <span class="t" style="font-size:25px;font-weight:600;color:${K.navy};line-height:1.2">${f(t)}${sub ? `<span style="display:block;font-weight:400;font-size:19px;color:${K.mute};margin-top:4px">${f(sub)}</span>` : ''}</span></div>`;
const branches = items => `<div style="position:relative;display:grid;grid-template-columns:repeat(${items.length},1fr);gap:16px;padding:22px 0">
  <div style="position:absolute;left:50%;top:0;height:22px;border-left:2px solid ${K.navy}"></div>
  <div style="position:absolute;left:${50 / items.length}%;right:${50 / items.length}%;top:22px;border-top:2px solid ${K.navy}"></div>
  <div style="position:absolute;left:${50 / items.length}%;right:${50 / items.length}%;bottom:22px;border-top:2px solid ${K.navy}"></div>
  <div style="position:absolute;left:50%;bottom:0;height:22px;border-left:2px solid ${K.navy}"></div>
  ${items.map(x => `<div style="position:relative;text-align:center;padding:10px 0"><div style="position:absolute;left:50%;top:0;height:10px;border-left:2px solid ${K.navy}"></div><div style="position:absolute;left:50%;bottom:0;height:10px;border-left:2px solid ${K.navy}"></div>
    <span class="t" style="display:inline-block;background:${K.paper};border-radius:22px;padding:9px 20px;font-size:20px;font-weight:500;color:${K.navy}">${f(x)}</span></div>`).join('')}</div>`;
const link = `<div style="height:20px;margin-left:50%;border-left:2px solid ${K.navy}"></div>`;
const i01 = () => frame('Infographie · TVA', `
  ${title('Société étrangère, clients internationaux : comment déterminer les règles de TVA applicables ?', 44)}
  <div style="margin-top:26px">
    ${q(1, 'S’agit-il d’une vente de biens ou de services ?')}
    ${branches(['Livraison de biens', 'Prestation de services'])}
    ${q(2, 'Le client est-il un professionnel ou un particulier ?')}
    ${branches(['Professionnel (B2B)', 'Particulier (B2C)'])}
    ${q(3, 'Dans quel pays se situe le client ?')}
    ${branches(['France', 'Autre État de l’UE', 'Hors UE'])}
    ${q(4, 'Existe-t-il une règle particulière ?', 'Autoliquidation, seuil de 10 000 €, immobilier, événements…')}
    ${link}
    ${q(5, 'Quelles obligations déclaratives examiner ?', 'Identification, déclarations, guichet unique OSS ou IOSS…')}
  </div>
  <div class="dark" style="margin-top:18px;padding:18px 26px;font:400 21px/1.42 Inter">${f('Le pays d’immatriculation de la société ne suffit pas : le traitement TVA se détermine opération par opération.')}</div>`, { reserve: RES });

// ———————————————————— 02 · SEUIL DE 10 000 €
const i02 = () => frame('Infographie · TVA européenne', `
  ${title('Le seuil de 10 000 € : ce que les entrepreneurs qui vendent en Europe doivent comprendre.', 44)}
  <div style="display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center;margin-top:30px;padding:26px 0;border-top:1px solid ${K.line};border-bottom:1px solid ${K.line}">
    <div class="n" style="font-size:96px;font-weight:600;letter-spacing:-.04em;line-height:1">${f('10 000 €')}</div>
    <div class="t" style="font-size:21px;line-height:1.42">${f('Hors taxe, par année civile, tous États membres confondus. Montant apprécié sur l’année en cours et sur l’année précédente.')}</div></div>
  <div class="lab" style="color:${K.mute};margin-top:26px">Opérations concernées, et elles seules</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
    ${[['A', 'Ventes à distance intracommunautaires de biens', 'Biens expédiés depuis un État membre vers des particuliers d’un autre État membre.'], ['B', 'Services électroniques, de télécommunication et de radiodiffusion', 'Fournis à des particuliers établis dans d’autres États membres.']].map(([l, t, d]) => `<div class="tint" style="padding:20px 22px"><span class="lab" style="color:${K.mute}">${l}</span><div class="t" style="margin-top:8px;font-size:22px;font-weight:600;color:${K.navy};line-height:1.22">${f(t)}</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.4;color:${K.mute}">${f(d)}</div></div>`).join('')}</div>
  <div class="t" style="margin-top:12px;font-size:19px;color:${K.mute}">${f('Condition : le vendeur est établi dans un seul État membre de l’Union.')}</div>
  <div class="lab" style="color:${K.mute};margin-top:26px">Localisation de la TVA</div>
  <div style="position:relative;margin-top:16px">
    <div style="display:grid;grid-template-columns:42% 58%;height:14px"><div style="background:${K.tint}"></div><div style="background:${K.navy}"></div></div>
    <div style="position:absolute;left:42%;top:-10px;height:34px;border-left:2px solid ${K.navy}"></div>
    <div class="n" style="position:absolute;left:42%;top:30px;transform:translateX(-50%);font-size:17px;font-weight:600">${f('10 000 €')}</div>
    <div style="display:grid;grid-template-columns:42% 58%;margin-top:40px">
      <div class="t" style="font-size:19px;line-height:1.4;padding-right:22px"><b style="font-weight:600;color:${K.navy}">En deçà</b><br>${f('TVA du pays du vendeur, avec option possible pour celle du pays du client.')}</div>
      <div class="t" style="font-size:19px;line-height:1.4;padding-left:22px"><b style="font-weight:600;color:${K.navy}">Au-delà</b><br>${f('TVA du pays du client, dès l’opération qui fait dépasser le seuil.')}</div></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px">
    <div class="box" style="padding:18px 22px"><div class="lab">Guichet unique OSS</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.4">${f('Permet, lorsqu’il est utilisé, de déclarer et payer cette TVA depuis son pays d’établissement.')}</div></div>
    <div class="dark" style="padding:18px 22px"><div class="lab" style="color:rgba(255,255,255,.7)">Ne concerne pas</div><div style="margin-top:8px;font:400 19px/1.4 Inter">${f('Les ventes B2B, les autres prestations de services, les vendeurs établis hors UE, les biens importés de pays tiers.')}</div></div></div>`,
  { reserve: 'Information générale. Règles issues de la directive (UE) 2017/2455, applicables depuis le 1er juillet 2021. À valider par un expert.' });

// ———————————————————— 03 · COACHING / PRÉENREGISTRÉ / MIXTE
const i03 = () => { const cols = ['Coaching individuel', 'Formation préenregistrée', 'Formule mixte'];
  const rows = [
    ['Personnalisation', 'Élevée : adaptée à la personne', 'Faible : contenu identique pour tous', 'Variable selon l’accompagnement'],
    ['Intervention humaine', 'Essentielle, en direct', 'Minimale ou nulle', 'Partielle : séances, échanges'],
    ['Automatisation', 'Faible', 'Forte : accès et diffusion automatisés', 'Partielle'],
    ['Nature du service', 'Prestation dont le contenu est à qualifier', 'Peut relever des services fournis par voie électronique', 'Élément principal ou éléments distincts à identifier'],
    ['Point d’attention', 'Règles selon le client (B2B ou B2C) et son pays', 'Régime des services électroniques, seuil de 10 000 €, OSS', 'Analyse au cas par cas de l’offre réelle']];
  return frame('Infographie · TVA & formation', `
  ${title('Coaching individuel et formation préenregistrée : pourquoi le traitement TVA peut différer.', 44)}
  <div style="margin-top:30px;display:grid;grid-template-columns:200px repeat(3,1fr)">
    <div></div>${cols.map((c, i) => `<div style="padding:18px 16px;${i === 1 ? `background:${K.navy};color:#fff` : `background:${K.paper}`};margin-left:${i ? 0 : 0}px;border-left:1px solid #fff"><div class="lab" style="color:${i === 1 ? 'rgba(255,255,255,.7)' : K.mute}">0${i + 1}</div><div style="margin-top:8px;font:600 23px/1.2 Inter">${f(c)}</div></div>`).join('')}
    ${rows.map(([h, ...c]) => `<div class="lab" style="padding:28px 14px 26px 0;border-bottom:1px solid ${K.line};color:${K.mute};line-height:1.45">${f(h)}</div>${c.map(x => `<div class="t" style="padding:26px 16px;border-bottom:1px solid ${K.line};font-size:21px;line-height:1.4">${f(x)}</div>`).join('')}`).join('')}
  </div>
  <div class="dark" style="margin-top:auto;padding:22px 26px;font:400 22px/1.42 Inter">${f('C’est le fonctionnement réel de l’offre, et non son nom commercial, qui guide l’analyse. Aucune catégorie n’emporte automatiquement un traitement identique.')}</div>`, { reserve: RES }); };

// ———————————————————— 04 · PARCOURS D'UN ENCAISSEMENT (flux horizontal)
const i04 = () => { const steps = [['Client', 'Paie par carte, virement ou portefeuille.'], ['Solution de paiement', 'Accepte le paiement en ligne ou en boutique.'], ['Traitement', 'Autorisation, réseaux, banques, contrôles.'], ['Reversement', 'Fonds versés, nets de frais, selon le calendrier.'], ['Compte de réception', 'Compte de paiement ou bancaire de l’entreprise.'], ['Comptabilité', 'Vente, frais et encaissement enregistrés.']];
  const stages = [['Encaissement', 1, 2], ['Traitement du paiement', 3, 3], ['Transit des fonds', 4, 4], ['Réception', 5, 5], ['Enregistrement', 6, 6]];
  return frame('Infographie · Paiements', `
  ${title('Du paiement du client à l’argent disponible sur ton compte : comprends le parcours.', 44)}
  <div style="margin-top:44px;display:grid;grid-template-columns:repeat(6,1fr);position:relative">
    <div style="position:absolute;left:8.33%;right:8.33%;top:39px;border-top:2px solid ${K.navy}"></div>
    ${steps.map(([t], i) => `<div style="display:flex;justify-content:center;position:relative"><span class="n" style="width:80px;height:80px;border-radius:50%;${i === 4 ? `background:${K.navy};color:#fff` : `background:#fff;border:2px solid ${K.navy}`};display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600">${i + 1}</span>${i < 5 ? `<span style="position:absolute;right:-7px;top:32px;width:0;height:0;border-left:12px solid ${K.navy};border-top:8px solid transparent;border-bottom:8px solid transparent"></span>` : ''}</div>`).join('')}
    ${steps.map(([t, d]) => `<div style="padding:22px 8px 0;text-align:center"><div class="t" style="font-size:22px;font-weight:600;color:${K.navy};line-height:1.2;min-height:54px">${f(t)}</div><div class="t" style="margin-top:10px;font-size:19px;line-height:1.4;color:${K.mute}">${f(d)}</div></div>`).join('')}
  </div>
  <div style="margin-top:26px;display:grid;grid-template-columns:repeat(6,1fr);gap:6px">${stages.map(([s, a, b], i) => `<div style="grid-column:${a} / ${b + 1};border-top:4px solid ${i % 2 ? K.navy : K.mute};padding-top:10px;text-align:center"><span class="lab" style="font-size:13px;letter-spacing:.14em">${f(s)}</span></div>`).join('')}</div>
  <div style="margin-top:56px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="tint" style="padding:26px 26px"><div class="lab" style="color:${K.mute}">À retenir</div><div class="t" style="margin-top:12px;font-size:23px;line-height:1.42">${f('Le montant reçu peut différer du montant payé : frais, délais, réserves, remboursements et contestations.')}</div></div>
    <div class="tint" style="padding:22px 24px"><div class="lab" style="color:${K.mute}">En comptabilité</div><div class="t" style="margin-top:12px;font-size:23px;line-height:1.42">${f('La vente, les frais du prestataire et l’encaissement sont des écritures distinctes, à rapprocher.')}</div></div></div>
  <div class="box" style="margin-top:auto;padding:22px 24px;font:400 22px/1.42 Inter;color:${K.ink}">${f('Chaque intervenant a son rôle et ses conditions contractuelles : délais de reversement, frais, gestion des litiges. À vérifier auprès de son prestataire.')}</div>`, { reserve: RES }); };

// ———————————————————— 05 · CASCADE CA → RÉSULTAT → TRÉSORERIE
const i05 = () => { // Exemple fictif cohérent : 200 000 − 150 000 = 50 000 ; 50 000 − 30 000 + 8 000 − 12 000 = 16 000 ; 20 000 + 16 000 = 36 000.
  const S = 2.05, base = 470; // px pour 1 000 €, ligne de base du graphique
  const bars = [['Chiffre d’affaires', 0, 200, 'tot'], ['Charges', 50, 200, 'neg'], ['Résultat comptable', 0, 50, 'tot'], ['Factures non encaissées', 20, 50, 'neg'], ['Amortissements (non décaissés)', 20, 28, 'pos'], ['Remboursement d’emprunt', 16, 28, 'neg'], ['Variation de trésorerie', 0, 16, 'tot']];
  const val = ['200 000 €', '− 150 000 €', '50 000 €', '− 30 000 €', '+ 8 000 €', '− 12 000 €', '16 000 €'];
  const W = 920, bw = 92, gap = (W - bars.length * bw) / (bars.length - 1);
  const svg = `<svg width="${W}" height="${base + 92}" viewBox="0 0 ${W} ${base + 92}" style="display:block;overflow:visible">
    <line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="${K.navy}" stroke-width="2"/>
    ${bars.map(([l, a, b, k], i) => { const x = i * (bw + gap), y = base - b * S, h = (b - a) * S; const fill = k === 'tot' ? K.navy : k === 'neg' ? '#fff' : K.tint;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${fill}" stroke="${K.navy}" stroke-width="2" ${k === 'neg' ? 'stroke-dasharray="6 4"' : ''}/>
      ${i < bars.length - 1 ? `<line x1="${x + bw}" y1="${base - (k === 'neg' ? a : b) * S}" x2="${x + bw + gap}" y2="${base - (k === 'neg' ? a : b) * S}" stroke="${K.mute}" stroke-width="1.5" stroke-dasharray="3 3"/>` : ''}
      <text x="${x + bw / 2}" y="${y - 12}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="19" fill="${K.navy}">${f(val[i])}</text>`; }).join('')}
  </svg>`;
  const labels = `<div style="display:grid;grid-template-columns:repeat(7,${bw}px);column-gap:${gap}px;margin-top:-80px">${bars.map(([l]) => `<div class="t" style="font-size:17px;line-height:1.28;text-align:center;color:${K.ink}">${f(l)}</div>`).join('')}</div>`;
  return frame('Infographie · Comptabilité & trésorerie', `
  ${title('Chiffre d’affaires, résultat comptable, trésorerie : trois notions différentes.', 44)}
  <div class="lab" style="color:${K.mute};margin-top:22px">Exemple chiffré fictif · une année d’activité</div>
  <div style="margin-top:56px">${svg}${labels}</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:34px;border-top:1px solid ${K.line}">
    ${[['Chiffre d’affaires', 'Ventes facturées sur la période.'], ['Résultat comptable', 'Produits moins charges, encaissés ou non. Les charges incluent ici 8 000 € d’amortissements.'], ['Trésorerie', 'Argent réellement entré et sorti des comptes.']].map(([t, d], i) => `<div style="padding:18px ${i < 2 ? 22 : 0}px 0 ${i ? 22 : 0}px;${i ? `border-left:1px solid ${K.line}` : ''}"><div class="t" style="font-size:21px;font-weight:600;color:${K.navy}">${f(t)}</div><div class="t" style="margin-top:6px;font-size:18px;line-height:1.4;color:${K.mute}">${f(d)}</div></div>`).join('')}</div>
  <div class="dark" style="margin-top:26px;padding:18px 26px;display:flex;justify-content:space-between;align-items:center;font:400 20px/1.4 Inter"><span>${f('Trésorerie de début 20 000 € + variation 16 000 €')}</span><span class="n" style="font-size:24px;font-weight:600">${f('= 36 000 € disponibles')}</span></div>`,
  { reserve: 'Chiffres fictifs, hors impôt et TVA, à visée pédagogique. Information générale à valider par un expert.' }); };

// ———————————————————— 06 · DEUX ESPACES : SOCIÉTÉ / DIRIGEANT
const i06 = () => { const flows = [['Rémunération du dirigeant', 'Décidée selon les règles de la société. Charges sociales et impôt sur le revenu possibles.'], ['Dividendes', 'Si des bénéfices distribuables existent et après décision des associés. Fiscalité applicable.'], ['Remboursement de frais', 'Dépenses avancées pour la société, sur justificatifs.']];
  return frame('Infographie · Organisation financière', `
  ${title('L’argent de ta société n’est pas automatiquement ton argent personnel.', 46)}
  <div style="margin-top:40px;display:grid;grid-template-columns:300px 1fr 300px;align-items:stretch;min-height:560px">
    <div class="dark" style="padding:26px 24px;display:flex;flex-direction:column"><div class="lab" style="color:rgba(255,255,255,.7)">Patrimoine de la société</div><div style="margin-top:14px;font:600 30px/1.15 Inter">La société</div>
      <div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.25);font:600 20px Inter">Trésorerie</div><div style="margin-top:8px;font:400 20px/1.42 Inter;color:rgba(255,255,255,.75)">${f('Appartient à la société, même si tu en es l’unique associé.')}</div>
      <div style="margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.25);font:600 20px Inter">Dépenses professionnelles</div><div style="margin-top:8px;font:400 20px/1.42 Inter;color:rgba(255,255,255,.75)">${f('Engagées dans l’intérêt de la société et justifiées.')}</div></div>
    <div style="display:flex;flex-direction:column;justify-content:center;gap:30px;padding:0 0">
      ${flows.map(([t, d]) => `<div style="position:relative;padding:14px 20px 16px;margin:0 -1px"><div style="position:absolute;left:0;right:14px;top:0;border-top:2px solid ${K.navy}"></div><span style="position:absolute;right:0;top:-8px;border-left:16px solid ${K.navy};border-top:9px solid transparent;border-bottom:9px solid transparent"></span>
        <div class="t" style="font-size:22px;font-weight:600;color:${K.navy}">${f(t)}</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.4;color:${K.mute}">${f(d)}</div></div>`).join('')}</div>
    <div class="box" style="padding:26px 24px;display:flex;flex-direction:column"><div class="lab" style="color:${K.mute}">Patrimoine personnel</div><div class="t" style="margin-top:14px;font-size:30px;font-weight:600;color:${K.navy};line-height:1.15">Le dirigeant</div>
      <div class="t" style="margin-top:26px;padding-top:18px;border-top:1px solid ${K.line};font-size:19px;line-height:1.42">${f('Ne reçoit des fonds de la société que par des voies prévues et documentées.')}</div>
      <div class="t" style="margin-top:20px;padding-top:18px;border-top:1px solid ${K.line};font-size:19px;line-height:1.42">${f('Les sommes reçues ont leur propre régime fiscal et social.')}</div></div>
  </div>
  <div class="tint" style="margin-top:auto;padding:24px 26px"><div class="lab" style="color:${K.mute}">Point d’attention</div><div class="t" style="margin-top:10px;font-size:21px;line-height:1.42">${f('Un prélèvement sans fondement peut être requalifié et entraîner des conséquences fiscales, sociales ou juridiques. Les modalités dépendent de la forme de la société et du pays.')}</div></div>
  <div class="t" style="margin-top:16px;font-size:18px;line-height:1.4;color:${K.mute}">${f('Ce schéma concerne une société. L’entreprise individuelle obéit à d’autres règles.')}</div>`, { reserve: RES }); };

// ———————————————————— 07 · DOSSIER DE FINANCEMENT (hub)
const i07 = () => { const blk = (t, d) => `<div class="box" style="padding:18px 20px"><div class="t" style="font-size:23px;font-weight:600;color:${K.navy};line-height:1.2">${f(t)}</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.4;color:${K.mute}">${f(d)}</div></div>`;
  const L = [['Revenus personnels justifiables', 'Rémunérations, dividendes, revenus réguliers et déclarés.'], ['Comptes et bilans', 'Plusieurs exercices de la société, si disponibles.'], ['Ancienneté et stabilité', 'Durée et régularité de l’activité.']];
  const R = [['Charges et crédits existants', 'Loyers, prêts en cours, engagements.'], ['Résidence et situation personnelle', 'Pays de résidence, situation familiale.'], ['Origine et traçabilité des revenus', 'Flux identifiables d’un compte à l’autre.']];
  return frame('Infographie · Financement', `
  ${title('Ton entreprise gagne de l’argent : comment préparer un dossier de financement personnel ?', 44)}
  <div style="margin-top:34px;display:grid;grid-template-columns:1fr 250px 1fr;gap:0;align-items:center">
    <div style="display:grid;gap:18px">${L.map(x => blk(...x)).join('')}</div>
    <div style="position:relative;height:100%;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;left:0;right:0;top:50%;border-top:2px solid ${K.navy}"></div>
      <div class="dark" style="position:relative;width:200px;height:250px;padding:22px 20px;display:flex;flex-direction:column;justify-content:space-between"><div class="lab" style="color:rgba(255,255,255,.7)">Examiné par le prêteur</div><div style="font:600 26px/1.15 Inter">Dossier de financement</div></div></div>
    <div style="display:grid;gap:18px">${R.map(x => blk(...x)).join('')}</div></div>
  <div style="height:30px;margin-left:50%;border-left:2px solid ${K.navy}"></div>
  <div style="display:grid;grid-template-columns:260px 1fr;border:2px solid ${K.navy}"><div class="dark" style="padding:20px 22px;font:600 22px/1.2 Inter">Capacité de remboursement</div><div class="t" style="padding:20px 24px;font-size:21px;line-height:1.42">${f('La synthèse : des revenus durables et justifiés, rapportés aux charges et à la mensualité envisagée.')}</div></div>
  <div class="tint" style="margin-top:auto;padding:22px 26px;font:400 22px/1.42 Inter;color:${K.ink}">${f('Les critères, les pièces et leur appréciation dépendent de l’établissement prêteur et de la situation individuelle. Aucune liste n’est exhaustive ni ne garantit un accord.')}</div>`, { reserve: RES }); };

// ———————————————————— 08 · TIMELINE + CHECKLIST IMMOBILIER
const i08 = () => { const ph = [['01', 'Préparer', 'Avant les visites', ['Justificatif d’identité', 'Justificatif de résidence']], ['02', 'Documenter', 'Avant l’offre', ['Justificatifs de provenance des fonds', 'Historique des mouvements financiers']], ['03', 'Constituer le dossier', 'Avant le compromis et le financement', ['Documents relatifs à l’activité professionnelle', 'Documents bancaires et justificatifs complémentaires']], ['04', 'Acquérir', 'Jusqu’à la signature de l’acte', ['Réponses aux demandes du notaire, de la banque et des autres professionnels']]];
  const box = `<span style="flex:none;width:24px;height:24px;border:2px solid ${K.navy};margin-top:2px"></span>`;
  return frame('Infographie · Immobilier', `
  ${title('Tu as les fonds pour acheter, mais as-tu les justificatifs nécessaires ?', 46)}
  <div style="margin-top:36px;position:relative">
    <div style="position:absolute;left:31px;top:10px;bottom:30px;border-left:2px solid ${K.navy}"></div>
    ${ph.map(([n, t, w, items], i) => `<div style="display:grid;grid-template-columns:64px 1fr;gap:24px;margin-bottom:${i < 3 ? 34 : 0}px;position:relative">
      <span class="n" style="width:64px;height:64px;border-radius:50%;${i === 3 ? `background:${K.navy};color:#fff` : `background:#fff;border:2px solid ${K.navy}`};display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:600">${n}</span>
      <div style="${i === 3 ? '' : `border-bottom:1px solid ${K.line};padding-bottom:22px`}"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px"><span class="t" style="font-size:27px;font-weight:600;color:${K.navy}">${t}</span><span class="lab" style="color:${K.mute};font-size:12px;letter-spacing:.16em;text-align:right">${f(w)}</span></div>
        <div style="margin-top:16px;display:grid;gap:14px">${items.map(x => `<div style="display:flex;gap:14px"><span style="display:flex">${box}</span><span class="t" style="font-size:23px;line-height:1.36">${f(x)}</span></div>`).join('')}</div></div></div>`).join('')}
  </div>
  <div class="tint" style="margin-top:auto;padding:22px 26px;font:400 22px/1.42 Inter;color:${K.ink}">${f('Les documents demandés dépendent de l’opération, des professionnels concernés et de la réglementation applicable, notamment en matière de lutte contre le blanchiment.')}</div>`, { reserve: 'Liste indicative et non exhaustive. Information générale à valider par un expert.' }); };

// ———————————————————— 09 · RÉSIDENCE FISCALE (schéma convergent)
const i09 = () => { const cr = [['Foyer ou lieu de séjour principal', 'Où vit habituellement la famille, où la personne séjourne principalement.'], ['Activité professionnelle principale', 'Où l’activité est exercée, sauf si elle est accessoire.'], ['Centre des intérêts économiques', 'Où se situent les investissements, la gestion des biens, l’essentiel des revenus.']];
  return frame('Infographie · Résidence fiscale', `
  ${title('Tu as quitté la France : comment analyser ta résidence fiscale ?', 48)}
  <div class="lab" style="color:${K.mute};margin-top:24px">Droit fiscal français · trois critères alternatifs</div>
  <div style="margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${cr.map(([t, d]) => `<div class="box" style="padding:20px 20px 22px;position:relative"><div class="t" style="font-size:21px;font-weight:600;color:${K.navy};line-height:1.22">${f(t)}</div><div class="t" style="margin-top:8px;font-size:17px;line-height:1.38;color:${K.mute}">${f(d)}</div></div>`).join('')}</div>
  <div style="position:relative;height:44px"><div style="position:absolute;left:16.6%;right:16.6%;top:22px;border-top:2px solid ${K.navy}"></div>${[16.6, 50, 83.4].map(x => `<div style="position:absolute;left:${x}%;top:0;height:22px;border-left:2px solid ${K.navy}"></div>`).join('')}<div style="position:absolute;left:50%;top:22px;height:22px;border-left:2px solid ${K.navy}"></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="tint" style="padding:20px 22px"><div class="lab" style="color:${K.mute}">France</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.42">${f('Chaque critère s’apprécie à partir d’un ensemble de faits. Un seul critère rempli peut suffire à caractériser un domicile fiscal en France.')}</div></div>
    <div class="tint" style="padding:20px 22px"><div class="lab" style="color:${K.mute}">Autre État</div><div class="t" style="margin-top:8px;font-size:19px;line-height:1.42">${f('Le pays d’accueil applique ses propres critères. Deux États peuvent alors te considérer comme résident.')}</div></div></div>
  <div style="height:26px;margin-left:50%;border-left:2px solid ${K.navy}"></div>
  <div style="border:2px solid ${K.navy};padding:20px 24px"><div class="t" style="font-size:22px;font-weight:600;color:${K.navy}">${f('Convention fiscale entre les deux États, si elle existe')}</div>
    <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center">${['Foyer d’habitation permanent', 'Centre des intérêts vitaux', 'Séjour habituel', 'Nationalité', 'Accord entre États'].map((x, i, a) => `<span class="t" style="font-size:17px;background:${K.paper};padding:7px 12px">${f(x)}</span>${i < a.length - 1 ? `<span style="color:${K.mute};font-size:18px">→</span>` : ''}`).join('')}</div>
    <div class="t" style="margin-top:10px;font-size:16px;color:${K.mute}">${f('Ordre fréquent des critères départageants, à vérifier dans la convention applicable.')}</div></div>
  <div style="height:26px;margin-left:50%;border-left:2px solid ${K.navy}"></div>
  <div class="dark" style="padding:20px 26px;font:400 21px/1.42 Inter">${f('La résidence fiscale résulte de l’examen de la situation globale, faits et justificatifs à l’appui. Aucun indice isolé ne la détermine automatiquement.')}</div>`, { reserve: 'Critères de l’article 4 B du Code général des impôts. Information générale à valider par un expert.' }); };

// ———————————————————— 10 · 7 QUESTIONS (grille de diagnostic)
const i10 = () => { const Q = [['Où le dirigeant est-il résident fiscal ?', 'Fiscalité personnelle'], ['Où se trouve l’activité réelle ?', 'Substance'], ['Dans quels pays sont les clients ?', 'Marchés'], ['Quels types de produits ou services sont vendus ?', 'TVA'], ['Où les décisions de gestion sont-elles prises ?', 'Direction effective'], ['Quelles sont les obligations fiscales, comptables et administratives ?', 'Conformité'], ['La structure sera-t-elle adaptée aux besoins futurs de l’entreprise ?', 'Stratégie']];
  return frame('Infographie · Structuration internationale', `
  <div style="display:grid;grid-template-columns:180px 1fr;gap:28px;align-items:end"><div class="n" style="font-size:190px;font-weight:600;line-height:.8;letter-spacing:-.06em">7</div>${title('questions à se poser avant de créer une société à l’étranger.', 46)}</div>
  <div style="margin-top:36px;border-top:2px solid ${K.navy}">${Q.map(([t, d], i) => `<div style="display:grid;grid-template-columns:64px 1fr 200px;align-items:center;gap:18px;padding:24px 0;border-bottom:1px solid ${K.line}">
    <span class="n" style="font-size:24px;font-weight:600;color:${K.mute}">0${i + 1}</span><span class="t" style="font-size:25px;font-weight:500;color:${K.navy};line-height:1.28">${f(t)}</span><span class="lab" style="font-size:12px;letter-spacing:.16em;color:${K.mute};text-align:right">${f(d)}</span></div>`).join('')}</div>
  <div class="dark" style="margin-top:auto;padding:24px 26px;font:400 22px/1.42 Inter">${f('Une structure se choisit après analyse de la situation globale, pas uniquement en fonction d’un taux d’imposition.')}</div>`, { reserve: RES }); };

export const INFOGRAPHIES = [
  ['01-tva-arbre-de-decision', 'TVA : où dois-tu payer ?', 'Arbre de décision', i01],
  ['02-seuil-europeen-10000', 'Le seuil européen de 10 000 €', 'Jauge à seuil et encadrés', i02],
  ['03-coaching-vs-preenregistre', 'Coaching individuel vs module préenregistré', 'Tableau comparatif 3 colonnes', i03],
  ['04-parcours-encaissement', 'Le parcours d’un encaissement', 'Flux horizontal', i04],
  ['05-ca-resultat-tresorerie', 'Chiffre d’affaires, résultat et trésorerie', 'Cascade financière', i05],
  ['06-argent-societe-vs-personnel', 'Argent de l’entreprise vs argent personnel', 'Deux espaces et flux', i06],
  ['07-capacite-emprunt', 'Capacité d’emprunt de l’entrepreneur international', 'Dossier central et blocs', i07],
  ['08-achat-immobilier-justificatifs', 'Achat immobilier : les justificatifs à anticiper', 'Timeline et checklist', i08],
  ['09-residence-fiscale', 'Résidence fiscale : les critères à examiner', 'Schéma d’analyse convergent', i09],
  ['10-societe-etranger-7-questions', 'Avant de créer une société à l’étranger', 'Grille de diagnostic', i10],
];
