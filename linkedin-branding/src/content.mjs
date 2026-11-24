// Contenus communs aux trois directions : seuls la composition et le traitement graphique changent.
// Tout contenu fiscal, comptable, juridique ou bancaire doit être validé par les experts FYNOVATES avant publication.

export const MARQUE = {
  nom: 'FYNOVATES',
  slogan: 'Conseil fiscal, comptabilité & structuration internationale.',
  site: 'fynovates.com',
  expertises: ['Fiscalité nationale et internationale', 'TVA', 'Comptabilité', 'Structuration juridique et internationale', 'Solutions bancaires professionnelles', 'Résidence fiscale et expatriation', 'Entrepreneurs digitaux', 'Organisation financière et administrative'],
  court: ['Fiscalité', 'TVA', 'Comptabilité', 'Structuration', 'Solutions bancaires'],
};

export const PAGE = {
  secteur: 'Services de conseil',
  lieu: '[Ville, pays du siège]',
  abonnes: '[N] abonnés',
  taille: '[Taille de l’entreprise]',
  presentation: [
    'FYNOVATES est un cabinet de conseil fiscal, comptable et corporate dédié aux entrepreneurs et aux entreprises qui développent une activité à l’international.',
    'Nous accompagnons des consultants et freelances, des agences, des e-commerçants, des fondateurs de SaaS, des entrepreneurs digitaux et des dirigeants de sociétés internationales.',
    'Nos domaines d’intervention : fiscalité nationale et internationale, TVA, comptabilité, structuration juridique et internationale, solutions bancaires professionnelles, résidence fiscale et expatriation, organisation financière et administrative.',
    'Notre méthode : comprendre l’activité réelle, cartographier la situation, identifier les obligations dans chaque pays concerné, comparer les options, puis recommander une organisation cohérente, en coordonnant fiscalité, comptabilité, juridique et banque.',
    'Nous travaillons également aux côtés des banquiers, conseillers en gestion de patrimoine, avocats, experts-comptables et spécialistes de la mobilité internationale.',
  ],
  specialisations: 'Fiscalité internationale, TVA, Comptabilité, Structuration juridique, Solutions bancaires professionnelles, Résidence fiscale, Expatriation, Entrepreneurs digitaux',
};

export const RESERVE = 'Information générale. Chaque situation doit être analysée individuellement.';

export const EDITO = {
  titre: 'Une société étrangère ne supprime pas automatiquement la TVA française.',
  rubrique: 'Point de vigilance · TVA',
  texte: 'Le pays d’immatriculation ne suffit pas à déterminer les obligations de TVA. Ce qui compte : la nature des opérations, le lieu où elles sont imposables et la qualité des clients.',
};

export const INFOG = {
  titre: 'TVA et société étrangère : les éléments à examiner avant de déterminer les obligations applicables.',
  rubrique: 'Infographie · TVA',
  etapes: [
    ['Qualifier l’opération', 'Livraison de biens ou prestation de services ? Chaque catégorie suit ses propres règles de territorialité.'],
    ['Identifier le client', 'Professionnel assujetti (B2B) ou particulier (B2C) ? Dans quel pays est-il établi ?'],
    ['Déterminer le lieu d’imposition', 'La TVA est due là où l’opération est réputée réalisée, pas nécessairement dans le pays de la société.'],
    ['Examiner la présence en France', 'Établissement stable, stock, moyens humains et techniques, lieu de direction effective.'],
    ['Vérifier régimes et seuils', 'Autoliquidation en B2B, guichets uniques OSS et IOSS, seuil de 10 000 € pour certaines ventes B2C.'],
  ],
  distinctions: [['Siège de la société', 'Lieu d’imposition de l’opération'], ['Client professionnel (B2B)', 'Client particulier (B2C)'], ['Livraison de biens', 'Prestation de services']],
  synthese: 'Les obligations de TVA se déterminent opération par opération, à partir des faits. La seule domiciliation à l’étranger ne permet pas de conclure.',
};

export const CARROUSEL = {
  titre: 'Compte de paiement ou compte bancaire : quelles différences pour un entrepreneur ?',
  rubrique: 'Document · Banque',
  pages: [
    { k: 'cover' },
    { k: 'intro', kicker: 'Introduction', titre: 'Deux comptes, deux statuts juridiques', texte: ['Néobanques, établissements de paiement, banques traditionnelles : pour un entrepreneur, les offres se ressemblent. Toutes proposent un IBAN, une carte et des virements.', 'Pourtant, derrière l’interface, le statut de l’établissement change ce que le compte permet, et la manière dont les fonds sont protégés.'] },
    { k: 'cat', kicker: 'Catégorie 1', titre: 'Le compte bancaire', sous: 'Ouvert auprès d’un établissement de crédit agréé.', points: ['Reçoit des dépôts du public.', 'Peut accorder des crédits : découvert, prêts, cautions, selon la politique de l’établissement.', 'Dépôts couverts par la garantie des dépôts (en France, le FGDR) dans les limites prévues.'] },
    { k: 'cat', kicker: 'Catégorie 2', titre: 'Le compte de paiement', sous: 'Ouvert auprès d’un établissement de paiement ou de monnaie électronique.', points: ['Sert à exécuter des opérations de paiement : virements, prélèvements, cartes.', 'Ne permet pas, en principe, d’octroyer des crédits classiques.', 'Fonds protégés par cantonnement ou garantie spécifique, et non par la garantie des dépôts.'] },
    { k: 'table', kicker: 'Comparatif', titre: 'Les différences essentielles', cols: ['Compte bancaire', 'Compte de paiement'], rows: [['Établissement', 'Établissement de crédit', 'Établissement de paiement ou de monnaie électronique'], ['Opérations', 'Dépôts, paiements, crédit', 'Paiements'], ['Crédit', 'Possible selon l’établissement', 'En principe non'], ['Protection des fonds', 'Garantie des dépôts', 'Cantonnement des fonds'], ['IBAN', 'Oui', 'Oui, selon l’établissement']] },
    { k: 'list', kicker: 'Implications pratiques', titre: 'Ce que cela change pour votre activité', points: [['Financement', 'Un besoin de découvert ou de prêt oriente vers un établissement de crédit.'], ['Organisation', 'Un compte de paiement peut compléter un compte bancaire principal.'], ['Partenaires', 'Vérifiez les exigences de vos interlocuteurs : bailleurs, financeurs, administrations.'], ['Vérification', 'Contrôlez le statut de l’établissement sur le registre officiel (REGAFI en France).']] },
    { k: 'synth', kicker: 'Synthèse', titre: 'À retenir', texte: 'Le choix ne se fait pas sur l’application, mais sur le statut de l’établissement et sur vos besoins réels : volumes, devises, financement, sécurité des fonds.' },
    { k: 'end', titre: 'Structurer vos solutions bancaires professionnelles', texte: 'FYNOVATES vous aide à choisir une organisation bancaire cohérente avec votre activité, votre structure et vos pays d’intervention.' },
  ],
};

export const CAS = {
  titre: 'Cet e-commerçant perdait une partie de sa marge à cause d’un mauvais traitement TVA.',
  rubrique: 'Étude de cas · TVA e-commerce',
  mention: 'Cas type présenté à titre pédagogique. Situation anonymisée et simplifiée, chiffres fictifs.',
  situation: { titre: 'La situation', points: [['Profil', 'E-commerçant établi en France, société commerciale.'], ['Activité', 'Vente de produits en ligne à des particuliers.'], ['Clients', 'France et plusieurs pays de l’Union européenne.'], ['Pratique', 'TVA française appliquée à toutes les ventes, prix TTC identique partout.']] },
  probleme: { titre: 'Le problème', texte: 'Ses ventes B2C vers les autres pays de l’Union avaient dépassé le seuil de 10 000 €. La TVA était donc due dans le pays de chaque client, au taux local.', exemple: { lignes: [['Prix de vente TTC', '120,00 €', '120,00 €'], ['Taux de TVA', '20 % (France)', '25 % (pays du client)'], ['Prix hors taxe', '100,00 €', '96,00 €']], ecart: 'Écart : 4,00 € de marge perdue par commande, soit 4 % du prix hors taxe.' } },
  analyse: { titre: 'L’analyse', etapes: ['Cartographier les ventes par pays et par période.', 'Vérifier la date de dépassement du seuil.', 'Identifier les taux applicables dans chaque pays.', 'Mettre en place le guichet unique OSS.', 'Revoir la politique de prix TTC par pays.', 'Examiner la régularisation des périodes passées.'] },
  conclusion: { titre: 'L’enseignement', texte: 'Au-delà du seuil, le taux de TVA dépend du pays du client. Un prix TTC unique peut masquer un écart de marge sur chaque vente.' },
};

export const COMPARATIF = {
  titre: 'Résultat comptable ou trésorerie disponible ?',
  rubrique: 'Comparatif · Comptabilité',
  cols: [['Résultat comptable', 'Différence entre les produits et les charges d’un exercice, enregistrés selon leur date d’engagement, même s’ils ne sont pas encore encaissés ou payés.'], ['Trésorerie disponible', 'Montant réellement disponible sur les comptes à une date donnée, après les encaissements et décaissements effectifs.']],
  exemple: { titre: 'Exemple chiffré fictif', lignes: [['Résultat de l’exercice', '50 000 €'], ['Factures clients non encaissées', '− 30 000 €'], ['Remboursement d’emprunt (capital)', '− 12 000 €'], ['Amortissements (charges non décaissées)', '+ 8 000 €']], total: ['Variation de trésorerie', '16 000 €'] },
  conclusion: 'Une entreprise peut être bénéficiaire et manquer de trésorerie. Les deux indicateurs se pilotent ensemble.',
};

export const ACTU = {
  titre: 'Ventes B2C dans l’Union européenne : le seuil de 10 000 €',
  rubrique: 'Note d’information · TVA',
  date: 'Novembre 2026',
  vigueur: 'Règle en vigueur depuis le 1er juillet 2021',
  concernes: 'Entreprises établies dans un seul État membre qui réalisent des ventes à distance de biens, ou des services de télécommunication, de radiodiffusion et électroniques, à des particuliers d’autres États membres.',
  mecanisme: [['Le seuil', '10 000 € HT par an, tous pays de l’Union confondus, pour ces seules opérations.'], ['En deçà', 'La TVA du pays du vendeur peut s’appliquer.'], ['Au-delà', 'La TVA du pays du client s’applique, déclarable via le guichet unique OSS.']],
  attention: ['Ne concerne ni les ventes B2B, ni l’ensemble des prestations de services.', 'Ne s’applique pas aux entreprises établies hors de l’Union.', 'Le dépassement en cours d’année produit effet dès l’opération qui le provoque.'],
  source: 'Sources : directive (UE) 2017/2455, impots.gouv.fr. À faire valider avant publication.',
};

export const EXPERT = {
  rubrique: 'L’équipe',
  nom: '[Prénom Nom]',
  fonction: '[Fonction] · FYNOVATES',
  domaine: '[Domaine d’expertise]',
  bio: '[Courte présentation : parcours, expertises et types de dossiers accompagnés. À rédiger et valider avec la personne concernée.]',
  photo: 'Photo professionnelle à insérer',
};

export const METHODE = {
  titre: 'Comment FYNOVATES analyse une situation avant de recommander une structure internationale',
  rubrique: 'Méthodologie',
  etapes: [
    ['Comprendre l’activité', 'Modèle économique, clients, flux, projets.'],
    ['Cartographier l’existant', 'Sociétés, résidence fiscale des dirigeants, comptes, contrats.'],
    ['Identifier les obligations', 'Fiscales, TVA, comptables, sociales et déclaratives, pays par pays.'],
    ['Comparer les options', 'Scénarios, coûts, contraintes, substance requise.'],
    ['Vérifier la cohérence', 'Contrôle croisé fiscal, comptable, juridique et bancaire.'],
    ['Recommander et accompagner', 'Feuille de route, mise en place, suivi.'],
  ],
  pôles: ['Fiscalité', 'TVA', 'Comptabilité', 'Juridique', 'Banque'],
};

export const PARTENARIAT = {
  rubrique: 'Écosystème',
  mention: 'Exemple fictif · à remplacer par une collaboration réelle',
  titre: 'Rencontre professionnelle : [Nom du partenaire] × FYNOVATES',
  texte: '[Courte explication de la collaboration : objet, public concerné, apport de chaque partie. À valider avec le partenaire avant publication.]',
  personnes: [['[Prénom Nom]', '[Fonction] · [Partenaire]'], ['[Prénom Nom]', '[Fonction] · FYNOVATES']],
};

export const CORPORATE = {
  rubrique: 'Le cabinet',
  titre: 'Cinq expertises coordonnées pour accompagner les entreprises à l’international.',
  texte: 'Fiscalité, TVA, comptabilité, structuration juridique et solutions bancaires : chaque dossier est traité de manière transversale.',
  evenement: { rubrique: 'Événement', titre: 'FYNOVATES participe à [Nom de l’événement]', meta: [['Date', '[JJ mois AAAA]'], ['Lieu', '[Ville, lieu]'], ['Intervention', '[Thème de l’intervention]']], mention: 'À utiliser uniquement pour un événement réel.' },
};

// Légendes des publications dans le fil simulé.
export const POSTS = {
  edito: 'Une société immatriculée à l’étranger ne supprime pas, à elle seule, les obligations de TVA en France.\n\nTrois éléments à examiner en premier : la nature de vos opérations, le lieu où elles sont imposables et la qualité de vos clients…',
  infog: 'Avant de conclure qu’une société étrangère n’a « pas de TVA à payer en France », voici les cinq étapes d’analyse que nous suivons…',
  carrousel: 'Compte de paiement ou compte bancaire : derrière des interfaces similaires, deux statuts très différents. Notre document en 8 pages pour faire le point…',
  cas: 'Cas type : un e-commerçant appliquait la TVA française à toutes ses ventes européennes. Au-delà du seuil de 10 000 €, chaque vente lui coûtait une partie de sa marge…',
  comparatif: 'Résultat comptable et trésorerie disponible ne racontent pas la même histoire. Un exemple chiffré fictif pour comprendre l’écart…',
  actu: 'Note d’information : le seuil de 10 000 € concerne certaines ventes B2C dans l’Union européenne, pas l’ensemble de vos opérations…',
  expert: 'Nous vous présentons [Prénom Nom], [fonction] chez FYNOVATES…',
  methode: 'Avant toute recommandation de structure internationale, six étapes de vérification. Voici comment nous travaillons…',
  corporate: 'Fiscalité, TVA, comptabilité, structuration juridique, solutions bancaires : nos expertises sont coordonnées sur chaque dossier…',
  partenariat: '[Exemple fictif] Rencontre avec [Nom du partenaire] autour de [thème]…',
};
