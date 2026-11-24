// Carrousel « Compte de paiement ou compte bancaire » — 8 pages 1080 × 1350.
import { frame, title, fix, logo, K } from './style.mjs';
const f = fix, R = 'Document · Banque', N = 8;
const fo = i => `${String(i).padStart(2, '0')} / 0${N}`;
const kick = (t, dark) => `<div class="lab" style="color:${dark ? 'rgba(255,255,255,.65)' : K.mute};margin-bottom:18px">${f(t)}</div>`;
const RES = 'Information générale. Vérifier le statut de chaque prestataire et les conditions de chaque produit.';

const p1 = () => frame(R, `
  <div style="margin-top:auto">${kick('Document · 8 pages', true)}
  <h1 style="color:#fff;font-size:92px;line-height:1.02;letter-spacing:-.035em">${f('Compte de paiement ou compte bancaire ?')}</h1>
  <p style="margin-top:34px;max-width:800px;font:400 30px/1.4 Inter;color:rgba(255,255,255,.8)">${f('Comprendre les différences pour mieux organiser ses encaissements professionnels.')}</p>
  <div class="lab" style="margin-top:70px;color:rgba(255,255,255,.65)">Faire défiler →</div></div>`, { dark: true, folio: fo(1) });

const p2 = () => { const fn = [['Encaisser', 'Recevoir les paiements de tes clients.'], ['Transférer', 'Envoyer et recevoir des virements.'], ['Conserver', 'Détenir des fonds dans la durée.'], ['Gérer', 'Piloter les flux, les charges et les échéances.']];
  return frame(R, `${kick('Le problème')}${title('Tous les comptes ne remplissent pas la même fonction.', 64)}
  <p class="t" style="margin-top:30px;font-size:28px;line-height:1.48;max-width:880px">${f('Un entrepreneur utilise souvent plusieurs solutions financières en même temps. Chacune répond à un besoin précis.')}</p>
  <div style="margin-top:44px;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid ${K.line};border-left:1px solid ${K.line}">${fn.map(([t, d], i) => `<div style="padding:48px 32px 52px;border-right:1px solid ${K.line};border-bottom:1px solid ${K.line};${i === 0 ? `background:${K.paper}` : ''}"><div class="n" style="font-size:18px;font-weight:600;color:${K.mute}">0${i + 1}</div><div class="t" style="margin-top:18px;font-size:38px;font-weight:600;color:${K.navy}">${t}</div><div class="t" style="margin-top:12px;font-size:24px;line-height:1.42;color:${K.mute}">${f(d)}</div></div>`).join('')}</div>
  <p class="t" style="margin-top:auto;font-size:26px;line-height:1.45;color:${K.ink}">${f('Confondre ces fonctions conduit à de mauvais choix d’organisation.')}</p>`, { folio: fo(2) }); };

const p3 = () => { const st = ['Client', 'Processeur', 'Réseaux et banques', 'Reversement', 'Compte de l’entreprise'];
  return frame(R, `${kick('Le processeur de paiement')}${title('À quoi sert un processeur de paiement ?', 64)}
  <div style="margin-top:40px;display:grid;grid-template-columns:repeat(5,1fr);position:relative">
    <div style="position:absolute;left:10%;right:10%;top:35px;border-top:2px solid ${K.navy}"></div>
    ${st.map((s, i) => `<div style="text-align:center;position:relative"><span style="display:inline-block;width:72px;height:72px;border-radius:50%;${i === 1 ? `background:${K.navy}` : `background:#fff;border:2px solid ${K.navy}`}"></span><div class="t" style="margin-top:16px;font-size:21px;font-weight:600;color:${K.navy};line-height:1.25;padding:0 6px">${f(s)}</div></div>`).join('')}</div>
  <div style="margin-top:46px;border-top:2px solid ${K.navy}">${[['Accepter les paiements', 'Carte, portefeuille électronique, virement selon les solutions.'], ['Traiter les transactions', 'Autorisation, contrôles, échanges avec les réseaux et les banques.'], ['Gérer remboursements et contestations', 'Retours clients, litiges, rétrofacturations.'], ['Reverser les fonds', 'Vers ton compte, selon les délais, frais et conditions du prestataire.']].map(([t, d]) => `<div style="display:grid;grid-template-columns:380px 1fr;gap:24px;padding:32px 0;border-bottom:1px solid ${K.line}"><span class="t" style="font-size:27px;font-weight:600;color:${K.navy};line-height:1.25">${f(t)}</span><span class="t" style="font-size:23px;line-height:1.42;color:${K.mute}">${f(d)}</span></div>`).join('')}</div>
  <p class="t" style="margin-top:auto;font-size:25px;line-height:1.45">${f('Un processeur fait circuler l’argent. Il n’a pas vocation à servir de compte principal.')}</p>`, { folio: fo(3) }); };

const p4 = () => frame(R, `${kick('Le compte de paiement')}${title('Un compte de paiement n’est pas nécessairement un compte bancaire.', 60)}
  <div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
    <div class="tint" style="padding:34px 30px 36px"><div class="lab" style="color:${K.mute}">Qui le propose</div><div class="t" style="margin-top:14px;font-size:27px;line-height:1.4;color:${K.navy};font-weight:600">${f('Un établissement de paiement ou de monnaie électronique')}</div><div class="t" style="margin-top:12px;font-size:23px;line-height:1.42;color:${K.mute}">${f('Statut juridique distinct de celui d’un établissement de crédit.')}</div></div>
    <div class="tint" style="padding:34px 30px 36px"><div class="lab" style="color:${K.mute}">Fonctions possibles</div><div class="t" style="margin-top:14px;font-size:24px;line-height:1.6">${['IBAN et virements', 'Prélèvements', 'Cartes de paiement', 'Paiements en plusieurs devises, selon l’offre'].map(x => `— ${f(x)}`).join('<br>')}</div></div></div>
  <div class="box" style="margin-top:22px;padding:32px 30px"><div class="lab" style="color:${K.mute}">Ce qui le distingue</div><div class="t" style="margin-top:14px;font-size:25px;line-height:1.45">${f('Il sert à exécuter des opérations de paiement. Il ne permet pas de recevoir des dépôts au sens bancaire, et l’octroi de crédit y est, en principe, exclu ou très encadré.')}</div></div>
  <div class="dark" style="margin-top:auto;padding:32px 30px"><div class="lab" style="color:rgba(255,255,255,.7)">Protection des fonds</div><div style="margin-top:14px;font:400 26px/1.45 Inter">${f('Elle dépend notamment du statut de l’établissement et du produit proposé.')}</div></div>`, { folio: fo(4), reserve: RES });

const p5 = () => { const fn = [['Dépôts', 'Conserver les fonds de l’entreprise.'], ['Virements', 'Émettre et recevoir, en France et à l’international.'], ['Gestion des flux professionnels', 'Encaissements, prélèvements, échéances.'], ['Services complémentaires', 'Crédit, cautions, placements, selon l’établissement.'], ['Relation dans la durée', 'Un interlocuteur qui connaît ton activité.']];
  return frame(R, `${kick('Le compte bancaire')}${title('À quoi sert une relation bancaire classique ?', 64)}
  <div style="margin-top:44px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px">${fn.map(([t, d], i) => `<div class="${i === 4 ? 'dark' : 'box'}" style="padding:34px 28px 36px;${i === 4 ? 'grid-column:span 2' : ''}"><div class="t" style="font-size:29px;font-weight:600;${i === 4 ? 'color:#fff' : `color:${K.navy}`}">${t}</div><div style="margin-top:10px;font:400 23px/1.42 Inter;color:${i === 4 ? 'rgba(255,255,255,.75)' : K.mute}">${f(d)}</div></div>`).join('')}</div>
  <div class="tint" style="margin-top:auto;padding:30px 30px"><div class="t" style="font-size:25px;line-height:1.45">${f('Une relation bancaire peut contribuer à constituer un historique financier. Elle ne garantit pas, pour autant, un accès futur au crédit.')}</div></div>`, { folio: fo(5), reserve: RES }); };

const p6 = () => { const rows = [['Mécanisme principal', 'Garantie des dépôts (en France, le FGDR)', 'Protection des fonds par l’établissement'], ['Fonctionnement', 'Indemnisation en cas de défaillance, dans les limites prévues (100 000 € par déposant et par établissement pour les dépôts éligibles)', 'Cantonnement des fonds sur des comptes dédiés, ou couverture par une assurance ou une garantie'], ['Garantie des dépôts', 'Oui, pour les dépôts éligibles', 'Non, les fonds n’étant pas des dépôts bancaires']];
  return frame(R, `${kick('La protection des fonds')}${title('Tous les fonds ne bénéficient pas des mêmes protections.', 60)}
  <div style="margin-top:36px;display:grid;grid-template-columns:200px 1fr 1fr">
    <div></div><div class="dark" style="padding:24px 20px"><div style="font:600 23px/1.25 Inter">Dépôts bancaires éligibles</div></div><div class="tint" style="padding:24px 20px;border-left:1px solid #fff"><div class="t" style="font-size:23px;font-weight:600;color:${K.navy};line-height:1.25">${f('Fonds chez un établissement de paiement ou de monnaie électronique')}</div></div>
    ${rows.map(([h, a, b]) => `<div class="lab" style="padding:34px 14px 32px 0;border-bottom:1px solid ${K.line};color:${K.mute};line-height:1.45">${f(h)}</div><div class="t" style="padding:32px 20px;border-bottom:1px solid ${K.line};font-size:22px;line-height:1.42">${f(a)}</div><div class="t" style="padding:32px 20px;border-bottom:1px solid ${K.line};font-size:22px;line-height:1.42">${f(b)}</div>`).join('')}</div>
  <div class="box" style="margin-top:auto;padding:28px 30px;border:2px solid ${K.navy}"><div class="lab">À vérifier</div><div class="t" style="margin-top:12px;font-size:24px;line-height:1.45">${f('Un même groupe peut proposer plusieurs produits, via plusieurs entités. Vérifie l’entité contractante, son pays d’agrément et le produit réellement utilisé.')}</div></div>`, { folio: fo(6), reserve: RES }); };

const p7 = () => { const Q = ['Quel est le statut juridique du prestataire ?', 'Quel produit détiens-tu réellement ?', 'Où sont conservés les fonds ?', 'Quelles protections s’appliquent ?', 'Le service correspond-il à tes besoins professionnels et financiers ?'];
  return frame(R, `${kick('Comment choisir ?')}${title('Les 5 questions à vérifier avant de choisir ton organisation bancaire.', 58)}
  <div style="margin-top:40px">${Q.map((q, i) => `<div style="display:grid;grid-template-columns:120px 1fr;align-items:center;padding:40px 0;border-top:1px solid ${K.line}"><span class="n" style="font-size:52px;font-weight:600;color:${i === 4 ? K.navy : K.mute};letter-spacing:-.03em">0${i + 1}</span><span class="t" style="font-size:31px;font-weight:500;line-height:1.3;color:${K.navy}">${f(q)}</span></div>`).join('')}<div style="border-top:2px solid ${K.navy}"></div></div>
  <p class="t" style="margin-top:auto;font-size:23px;line-height:1.45;color:${K.mute}">${f('Registre officiel des établissements agréés en France : REGAFI.')}</p>`, { folio: fo(7) }); };

const p8 = () => frame(R, `${kick('Conclusion', true)}
  <h1 style="color:#fff;font-size:64px;line-height:1.08">${f('Encaisser, gérer et financer : trois besoins différents.')}</h1>
  <p style="margin-top:34px;font:400 25px/1.5 Inter;color:rgba(255,255,255,.82);max-width:880px">${f('Choisir une solution de paiement ou une relation bancaire ne doit pas se limiter aux frais et à la facilité d’ouverture. Il faut comprendre le statut du prestataire, les fonctions du compte et les besoins futurs de l’entreprise.')}</p>
  <div style="margin-top:auto;padding-top:34px;border-top:1px solid rgba(255,255,255,.22)">${logo(420, '#fff')}<p style="margin-top:20px;font:400 22px Inter;color:rgba(255,255,255,.75)">${f('Conseil fiscal, comptabilité & structuration internationale.')}</p>
  <p style="margin-top:30px;font:500 20px Inter;color:#fff">${f('Découvrez les autres analyses de Fynovates →')}</p></div>`, { dark: true, folio: fo(8) });

export const CARROUSEL = [p1, p2, p3, p4, p5, p6, p7, p8];
