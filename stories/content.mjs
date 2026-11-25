// FYNOVATES — Stories: all texts, photos and options.
// Edit this file, then run `node stories/build.mjs`. Layouts are in templates.mjs.
// Each screen: [template, variant, data, previewMock]
//   previewMock: 'sticker' adds a simulated Instagram sticker on the preview only (never on the clean export).
// Photos: names of the duotone files in instagram/assets/photos (without -duo.jpg).
// [Prénom] marks a field to fill with the real first name of the expert.

// ---------------------------------------------------------------------
// SÉQUENCES
// ---------------------------------------------------------------------
export const SEQUENCES = {
  A: { titre: 'TVA et société étrangère', pilier: 'Éducation', objectif: 'Montrer qu’une société à l’étranger ne supprime pas la TVA et identifier les abonnés concernés.', screens: [
    ['educ', 'question', { rubric: 'Fiscalité · TVA', kicker: 'Question fiscale', title: 'Ta société est à l’étranger. Et la TVA ?', lead: 'Une société créée hors de France ne fait pas disparaître la TVA. Tout dépend de tes clients, de leur pays et de ce que tu vends.', photo: 'tours-verre' }],
    ['sondage', null, { rubric: 'Fiscalité · TVA', question: 'Tu as une société à l’étranger ?', options: ['Oui', 'Non, mais j’y pense'] }, 'sticker'],
    ['educ', 'mecanisme', { rubric: 'Fiscalité · TVA', kicker: 'Le mécanisme', title: 'Trois questions décident de ta TVA', steps: ['Qui sont tes clients : des entreprises ou des particuliers ?', 'Où sont-ils établis : en France, dans l’Union européenne ou ailleurs ?', 'Que vends-tu : un bien, un service en direct ou un service électronique ?'], foot: 'La réponse change le pays et le taux de TVA' }],
    ['expert', 'portrait', { photo: 'femme-blazer', name: '[Prénom]', role: 'Experte TVA', topic: 'Vendre en ligne à des particuliers en France', point: 'Pour les services électroniques vendus à des particuliers, la TVA suit en principe le pays du client. Une société établie hors de France peut donc devoir de la TVA française.' }],
    ['conversion', 'cta', { rubric: 'Fiscalité · TVA', title: 'Ta situation est différente ?', text: 'Envoie-nous en message le pays de ta société, le type de clients et ce que tu vends. Nous te dirons si une analyse est nécessaire.', button: 'Envoyer un message' }],
  ] },
  B: { titre: 'Compte bancaire et processeur de paiement', pilier: 'Éducation', objectif: 'Corriger une idée reçue et ouvrir la discussion sur l’organisation bancaire.', screens: [
    ['educ', 'vraifaux', { rubric: 'Banque', kicker: 'Idée reçue', statement: '« Avec mon processeur de paiement, je n’ai pas besoin de compte bancaire professionnel. »' }],
    ['educ', 'comparaison', { rubric: 'Banque', title: 'Compte bancaire ou processeur de paiement ?', cols: ['Compte bancaire', 'Processeur de paiement'], rows: [
      ['Rôle', 'Recevoir, payer, épargner, gérer la trésorerie', 'Encaisser les paiements de tes clients'],
      ['Financement', 'Peut accorder un crédit', 'Ne finance pas ton activité'],
      ['Protection des fonds', 'Garantie des dépôts bancaires', 'Fonds protégés, mais sans garantie des dépôts'],
      ['Blocage', 'Encadré par la convention de compte', 'Possible lors d’un contrôle de risque'],
    ] }],
    ['educ', 'reponse', { rubric: 'Banque', kicker: 'Explication', title: 'Le processeur encaisse. La banque structure.', body: 'Un processeur de paiement collecte l’argent de tes ventes, puis le reverse sur un compte bancaire. Il ne remplace ni ton compte professionnel, ni ta relation avec une banque.', note: 'Garde toujours un compte bancaire au nom de ta société, dans un pays cohérent avec ton activité.' }],
    ['educ', 'erreur', { rubric: 'Banque', theme: 'navy', kicker: 'La conséquence', title: 'Sans relation bancaire, pas de financement', body: 'Pour un prêt, la banque regarde l’historique de ton compte professionnel et tes bilans. Des encaissements restés chez un processeur ne construisent pas cet historique.', fix: 'Fais transiter ton chiffre d’affaires par un compte professionnel dès le début.' }],
    ['conversion', 'cta', { rubric: 'Banque', photo: 'banque-facade', pos: 'center 30%', title: 'Organiser tes comptes avant de grandir', text: 'Nous t’aidons à choisir la bonne combinaison entre banque et processeur selon ton pays et ton activité.', button: 'Prendre rendez-vous', link: 'FYNOVATES.COM' }, 'sticker'],
  ] },
  C: { titre: 'Coulisses d’un dossier', pilier: 'Coulisses', objectif: 'Montrer la méthode et le niveau d’exigence du cabinet sur un dossier réel anonymisé.', screens: [
    ['coulisses', 'bas', { photo: 'reunion-docs', pos: '60% center', rubric: 'Coulisses · dossier', kicker: 'Dossier anonymisé', caption: 'Un e-commerçant installé au Portugal, avec des clients dans toute l’Europe.' }],
    ['coulisses', 'cadre', { photo: 'entretien', kicker: 'Étape 1', caption: 'Comprendre l’activité réelle : les flux, les pays et les clients.' }],
    ['educ', 'mecanisme', { rubric: 'Coulisses · dossier', theme: 'paper', kicker: 'Étape 2 · Vérifications', title: 'Ce que nous vérifions', steps: ['La résidence fiscale du dirigeant', 'Le pays des clients et le seuil européen de 10 000 €', 'Les factures et les mentions de TVA', 'Les comptes bancaires et les processeurs utilisés'], foot: 'Chaque point est documenté dans le dossier' }],
    ['coulisses', 'bas', { photo: 'signature', rubric: 'Coulisses · dossier', kicker: 'Étape 3 · Méthode', caption: 'Chaque recommandation est relue par un second expert avant d’être présentée.' }],
    ['educ', 'reponse', { rubric: 'Coulisses · dossier', kicker: 'Conclusion', title: 'Une recommandation écrite, avec ses raisons', body: 'Le client repart avec un document clair : ce qu’il doit corriger, dans quel ordre, et pourquoi.', foot: 'Tu veux faire analyser ta structure ? Écris-nous.' }],
  ] },
  D: { titre: 'Cas client immobilier', pilier: 'Cas clients', objectif: 'Illustrer l’importance de comptes et de justificatifs à jour avant un achat immobilier.', screens: [
    ['cas', 'couverture', { photo: 'londres', title: 'Il avait l’apport. L’achat a pourtant été bloqué.' }],
    ['cas', 'etape', { step: 0, title: 'Un entrepreneur installé à l’étranger veut acheter un appartement en France.', body: 'Ses revenus sont versés par sa société étrangère. Son apport est prêt.' }],
    ['cas', 'etape', { step: 1, label: 'Blocage', title: 'La banque et le notaire demandent l’origine des fonds.', body: 'Les justificatifs des dividendes et des virements entre pays manquent. Le dossier s’arrête.' }],
    ['educ', 'reponse', { rubric: 'Cas client', kicker: 'Explication', title: 'Pourquoi le dossier ne peut pas avancer', body: 'Les règles de lutte contre le blanchiment imposent de justifier l’origine de l’apport. Sans documents comptables et fiscaux cohérents, la banque et le notaire ne peuvent pas poursuivre.' }],
    ['cas', 'etape', { step: 4, title: 'Un achat immobilier se prépare dans les comptes, bien avant la signature.', body: 'Bilans, déclarations, justificatifs de distribution : rassemble-les avant de chercher un bien.', foot: 'Un projet d’achat ? Présente-nous ta situation en message.' }],
  ] },
  E: { titre: 'Questions des entrepreneurs', pilier: 'Interaction', objectif: 'Récolter les problématiques de l’audience et y répondre par un expert.', screens: [
    ['questions', 'appel', { rubric: 'Tes questions', title: 'Une question sur ta fiscalité ou ta structure ?', lead: 'Pose-la ici. Nous répondons aux plus fréquentes cette semaine.', prompt: 'Ta question pour le cabinet' }, 'sticker'],
    ['questions', 'recue', { rubric: 'Tes questions', question: 'Je suis freelance en France et je veux partir à Dubaï. Je ne paierai plus d’impôts en France ?' }],
    ['expert', 'video', { photo: 'homme-lunettes', name: '[Prénom]', role: 'Expert fiscalité internationale', topic: 'Partir ne suffit pas', point: 'Tu restes résident fiscal français si un seul critère de résidence reste en France.' }],
    ['educ', 'mecanisme', { rubric: 'Tes questions', kicker: 'Les critères', title: 'Les 3 critères de la résidence fiscale française', steps: ['Ton foyer ou ton lieu de séjour principal', 'Ton activité professionnelle principale', 'Le centre de tes intérêts économiques'], foot: 'Un seul critère rempli suffit pour rester résident' }],
    ['conversion', 'cta', { rubric: 'Tes questions', title: 'Un départ se prépare avant de partir', text: 'Résidence, sécurité sociale, société, banque : faisons le point sur ton projet avant de déménager.', button: 'Prendre rendez-vous', link: 'FYNOVATES.COM' }, 'sticker'],
  ] },
  F: { titre: 'Cas client TVA (modèle narratif complet)', pilier: 'Cas clients', objectif: 'Montrer les cinq étapes du modèle narratif sur une erreur de TVA fréquente.', screens: [
    ['cas', 'couverture', { title: 'Il pensait être à l’abri de la TVA française.' }],
    ['cas', 'etape', { step: 0, title: 'Une société à Dubaï, des formations vidéo vendues à des particuliers en France.' }],
    ['cas', 'etape', { step: 1, title: 'Aucune TVA facturée : « ma société n’est pas en France ».' }],
    ['cas', 'etape', { step: 2, title: 'Les services électroniques vendus à des particuliers sont en principe taxés dans le pays du client.' }],
    ['cas', 'etape', { step: 3, title: 'Un rappel de TVA sur plusieurs années, avec des pénalités possibles.' }],
    ['cas', 'etape', { step: 4, title: 'Ce n’est pas le pays de ta société qui compte, mais celui de ton client et son statut.' }],
  ] },
};

// ---------------------------------------------------------------------
// VARIANTES SUPPLÉMENTAIRES (galerie des modèles)
// ---------------------------------------------------------------------
export const VARIANTES = [
  ['educ', 'question', { rubric: 'Fiscalité · TVA', theme: 'white', kicker: 'Question fiscale', title: 'Coaching en direct ou formation enregistrée : même TVA ?', lead: 'Pas forcément. La qualification du service change les règles de TVA applicables.' }],
  ['educ', 'reponse', { rubric: 'Fiscalité · TVA', kicker: 'Réponse d’expert', title: 'Une formation enregistrée est un service électronique', body: 'Vendue à un particulier, elle suit en principe la TVA du pays de l’acheteur. Un coaching individuel en direct ne suit pas toujours la même règle : vérifie la qualification avant de facturer.' }],
  ['educ', 'verdict', { rubric: 'Banque', verdict: 'Faux', title: 'Un processeur de paiement ne remplace pas une banque.', body: 'Il encaisse tes ventes, mais il ne finance pas ton activité et ses fonds ne bénéficient pas de la garantie des dépôts bancaires.' }],
  ['educ', 'erreur', { rubric: 'Fiscalité · TVA', title: 'Ignorer le seuil européen de 10 000 €', body: 'Au-delà de 10 000 € de ventes à distance à des particuliers dans l’Union européenne, sur un an, la TVA du pays de chaque client s’applique.', fix: 'Suis ce total chaque mois, tous pays confondus, et prépare le guichet unique (OSS).' }],
  ['educ', 'comparaison', { rubric: 'Financement', title: 'Ce que la banque regarde avant un prêt', cols: ['Dossier solide', 'Dossier fragile'], rows: [['Comptes', 'Bilans déposés et à jour', 'Comptes en retard'], ['Revenus', 'Rémunération régulière et déclarée', 'Revenus irréguliers ou non déclarés'], ['Banque', 'Chiffre d’affaires sur le compte pro', 'Fonds restés chez un processeur'], ['Fiscalité', 'Résidence claire et déclarations faites', 'Situation fiscale floue']] }],
  ['sondage', null, { rubric: 'Quiz · TVA', kicker: 'Quiz', question: 'Le seuil européen des ventes à distance est de…', options: ['5 000 €', '10 000 €', '35 000 €', '100 000 €'], foot: 'Réponse dans la story suivante : 10 000 € par an' }, 'sticker'],
  ['sondage', null, { rubric: 'Résidence fiscale', theme: 'navy', photo: 'new-york', question: 'Ton prochain pays pour ton entreprise ?', options: ['Portugal', 'Espagne', 'Émirats', 'Je reste en France'] }, 'sticker'],
  ['questions', 'appel', { rubric: 'Tes problématiques', theme: 'paper', title: 'Quel sujet te bloque en ce moment ?', lead: 'TVA, banque, structure, résidence : dis-le nous. Les sujets les plus cités feront nos prochaines stories.', prompt: 'Ton sujet' }, 'sticker'],
  ['expert', 'portrait', { photo: 'homme-costume', pos: 'center 20%', name: '[Prénom]', role: 'Expert comptable', topic: 'Trésorerie : séparer la société et le dirigeant', point: 'Les sommes sur le compte de la société ne t’appartiennent pas directement : salaire, dividendes ou remboursements doivent suivre des règles précises.' }],
  ['coulisses', 'bas', { photo: 'bureaux', rubric: 'Coulisses', kicker: 'Environnement de travail', caption: 'Nos bureaux, là où sont préparés vos rendez-vous.' }],
  ['coulisses', 'cadre', { photo: 'documents-fiscaux', kicker: 'Préparation d’un rendez-vous', caption: 'Avant chaque rendez-vous, nous relisons les documents envoyés par le client.' }],
  ['alerte', null, { tag: 'ALERTE', date: '1er septembre 2027', rubric: 'Actualité fiscale', title: 'Facturation électronique : la deuxième étape approche', rule: 'Les PME et micro-entreprises devront émettre leurs factures au format électronique.', who: 'Les entreprises assujetties à la TVA établies en France.', impact: 'Choisis dès maintenant une plateforme agréée et adapte ta facturation.', source: 'impots.gouv.fr · à vérifier avant publication' }],
  ['alerte', null, { tag: 'RAPPEL', theme: 'navy', date: 'Règle en vigueur', rubric: 'Actualité TVA', title: 'Ventes à distance dans l’UE : le seuil de 10 000 €', rule: 'Au-delà de 10 000 € de ventes annuelles à des particuliers d’autres pays de l’UE, la TVA du pays du client s’applique.', who: 'Les e-commerçants et vendeurs de services électroniques établis dans l’UE.', impact: 'Déclare et paie cette TVA via le guichet unique OSS.', source: 'Commission européenne' }],
  ['conversion', 'services', { title: 'Les sujets que nous traitons', items: ['Fiscalité nationale et internationale', 'TVA et obligations fiscales', 'Comptabilité', 'Structuration juridique et internationale', 'Solutions bancaires professionnelles', 'Résidence fiscale et expatriation'] }],
  ['conversion', 'etapes', { rubric: 'Le cabinet', title: 'Un accompagnement en trois temps', steps: ['Premier échange : ta situation, tes objectifs, tes contraintes', 'Analyse : nos experts étudient ton dossier et ses risques', 'Recommandation écrite, puis mise en place si tu le souhaites'], foot: 'Prépare tes statuts, tes derniers comptes et tes factures types' }],
  ['conversion', 'cta', { rubric: 'Le cabinet', theme: 'white', kicker: 'Découvrir le cabinet', title: 'Toutes nos expertises sur notre site', text: 'Fiscalité, comptabilité, structuration, banque, résidence : découvre comment nous accompagnons les entrepreneurs internationaux.', link: 'FYNOVATES.COM' }, 'sticker'],
  ['republication', null, { format: 'vertical', image: 'assets/reel.png', kicker: 'Nouveau Reel', title: 'Les 3 erreurs des freelances à l’étranger' }],
  ['republication', null, { format: 'vertical', image: 'assets/tiktok.png', kicker: 'Sur TikTok', title: 'Holding : quand devient-elle rentable ?', theme: 'white' }],
  ['republication', null, { format: 'paysage', image: 'assets/youtube.png', kicker: 'Nouvelle vidéo YouTube', title: 'Résidence fiscale : les 3 critères expliqués' }],
  ['republication', null, { format: 'portrait', image: 'assets/carrousel.png', kicker: 'Nouveau carrousel', title: 'Facturer depuis l’étranger en 5 étapes', theme: 'white' }],
  ['republication', null, { format: 'texte', kicker: 'Sur LinkedIn', title: 'Notre analyse de la semaine', text: 'Ouvrir une société à l’étranger ne suffit pas à changer de résidence fiscale. Le lieu de vie, l’activité principale et le centre des intérêts économiques restent déterminants. Trois points à vérifier avant de partir.' }],
];

export const UNES = ['Le cabinet', 'Fiscalité', 'TVA', 'International', 'Banque', 'Équipe', 'Méthode', 'Contact'];
