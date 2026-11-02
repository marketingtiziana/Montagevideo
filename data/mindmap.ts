import type { Mindmap } from '@/data/types';

/**
 * Source de vérité du contenu de la mindmap « Comment fonctionne une LLC ».
 * Aucun chiffre, aucun montant : uniquement des mécanismes et des rôles.
 * Tout le texte affiché sur le board et dans le panneau latéral vient d'ici.
 */
export const mindmap: Mindmap = {
  seed: 20241107,
  rootId: 'llc',
  clusters: [
    { id: 'core', label: 'La LLC', color: '#0F1535', soft: '#E7EAF0' },
    { id: 'roles', label: 'Les acteurs', color: '#4F6BFF', soft: '#E8ECFF' },
    { id: 'documents', label: 'Les documents', color: '#2E9BE0', soft: '#E3F1FD' },
    { id: 'operations', label: 'Au quotidien', color: '#1FA389', soft: '#E1F5EF' },
    { id: 'obligations', label: 'Chaque année', color: '#5B6B8C', soft: '#E7EAF0' },
    { id: 'pitfalls', label: 'Les pièges', color: '#6E5BE8', soft: '#ECE8FF' },
  ],
  nodes: [
    /* ───────────────────────── A. C’est quoi une LLC ───────────────────────── */
    {
      id: 'llc',
      kind: 'sticky',
      cluster: 'core',
      title: 'LLC',
      body: 'Limited Liability Company : une société créée au niveau d’un État américain.',
      tint: 'indigo',
      size: 'lg',
      details: `# C’est quoi une LLC ?

**LLC** signifie *Limited Liability Company*. C’est une entité juridique créée au niveau d’un **État américain** (Wyoming, Delaware, New Mexico, etc.), et non au niveau fédéral.

## Un hybride
La LLC emprunte à deux mondes :
- à la **société** : la responsabilité limitée, qui protège le patrimoine personnel du propriétaire ;
- au **partnership** (l’équivalent d’une société de personnes) : la souplesse de fonctionnement et la transparence fiscale par défaut.

## Ce qu’il faut retenir
- Le patrimoine personnel du membre est **séparé** de celui de la LLC.
- Elle est **très flexible** : peu de formalisme, règles internes librement définies.
- **Aucune obligation de résider aux États-Unis** pour en créer une ou en être propriétaire.

> Explorez les branches du board : les acteurs, les documents, le fonctionnement au quotidien, les obligations annuelles et les pièges à éviter.`,
    },
    {
      id: 'hybrid',
      kind: 'sticky',
      cluster: 'core',
      title: 'Un hybride',
      body: 'Entre la société et le partnership : la protection de l’une, la souplesse de l’autre.',
      tint: 'sky',
      details: `# Un hybride entre société et partnership

La LLC n’est ni tout à fait une société classique, ni tout à fait une société de personnes.

- De la **société** (corporation), elle garde la **responsabilité limitée** : les dettes de la LLC restent celles de la LLC.
- Du **partnership**, elle garde la **souplesse** : pas de conseil d’administration imposé, pas d’assemblées formelles, des règles internes que les membres écrivent eux-mêmes.

C’est cette combinaison qui en fait la structure préférée des entrepreneurs indépendants et des petites équipes.`,
    },
    {
      id: 'liability',
      kind: 'sticky',
      cluster: 'core',
      title: 'Responsabilité limitée',
      body: 'Le patrimoine personnel du membre est protégé des dettes de la LLC.',
      tint: 'mint',
      details: `# La responsabilité limitée

C’est le « L » de LLC. En principe, un créancier de la LLC ne peut se payer que sur les biens **de la LLC**, pas sur ceux du membre.

## Concrètement
- Le patrimoine **personnel** (épargne, logement, véhicule) reste à l’abri des dettes de l’activité.
- Cette protection suppose de **respecter la séparation** entre la LLC et le membre : compte bancaire distinct, contrats au nom de la LLC, pas de mélange d’argent.

> La protection n’est pas absolue : elle peut être écartée en cas de fraude ou de confusion totale entre la LLC et son propriétaire.`,
    },
    {
      id: 'no-residence',
      kind: 'sticky',
      cluster: 'core',
      title: 'Sans vivre aux États-Unis',
      body: 'Aucune obligation de résidence ni de nationalité américaine pour créer ou détenir une LLC.',
      tint: 'slate',
      details: `# Aucune obligation de résider aux États-Unis

Un entrepreneur francophone peut créer et posséder une LLC **sans vivre aux États-Unis**, sans visa et sans nationalité américaine.

## Ce que cela implique
- La LLC a une adresse officielle dans son État grâce au **Registered Agent**.
- Le membre, lui, vit où il veut. C’est précisément son **pays de résidence fiscale** qui déterminera comment il est imposé.`,
    },
    {
      id: 'flexible',
      kind: 'sticky',
      cluster: 'core',
      title: 'Très flexible',
      body: 'Peu de formalisme : ce sont les membres qui écrivent les règles internes.',
      tint: 'indigo',
      size: 'sm',
      details: `# Une structure très flexible

Contrairement à une société classique, la LLC impose très peu de formalisme :

- pas de conseil d’administration obligatoire ;
- pas d’assemblée générale annuelle imposée par la loi ;
- une répartition des parts, des décisions et des distributions **librement définie** dans l’Operating Agreement.

C’est au membre (ou aux membres) de fixer les règles du jeu, par écrit.`,
    },
    {
      id: 'photo-skyline',
      kind: 'photo',
      cluster: 'core',
      title: 'Une entité créée dans un État',
      imageQuery: 'new york skyline blue sky office buildings',
      caption: 'La LLC naît dans un État américain, pas au niveau fédéral.',
      icon: 'building',
      ring: 1,
      details: `# Une création au niveau d’un État

Aux États-Unis, ce sont les **États** (Wyoming, Delaware, New Mexico, Floride, etc.) qui créent les sociétés, pas le gouvernement fédéral.

C’est donc auprès du **Secretary of State** de l’État choisi que la LLC est enregistrée. Le niveau fédéral (l’**IRS**) intervient ensuite pour la fiscalité : attribution de l’EIN et réception des déclarations fédérales.

Chaque État a ses propres règles (frais, rapport annuel, confidentialité des membres) : le choix de l’État n’est donc pas anodin.`,
    },

    /* ───────────────────────────── B. Les rôles ───────────────────────────── */
    {
      id: 'member',
      kind: 'card',
      cluster: 'roles',
      title: 'Membre',
      role: 'Membre (member)',
      icon: 'user',
      who: 'Le propriétaire. Un ou plusieurs, personne physique ou morale.',
      does: 'Détient les parts et perçoit les distributions.',
      required: 'required',
      ring: 0,
      details: `# Le membre (member)

Le **membre** est le **propriétaire** de la LLC. Il peut y en avoir un seul (*single-member LLC*) ou plusieurs (*multi-member LLC*).

- Un membre peut être une **personne physique** ou une **personne morale** (une autre société).
- Il perçoit les **distributions**, c’est-à-dire la part des bénéfices que la LLC lui verse.
- Ses droits, ses parts et ses obligations sont décrits dans l’**Operating Agreement**.

> Être membre ne demande ni nationalité américaine, ni résidence aux États-Unis.`,
    },
    {
      id: 'manager',
      kind: 'card',
      cluster: 'roles',
      title: 'Manager',
      role: 'Manager',
      icon: 'briefcase',
      who: 'Un membre, ou une personne désignée par les membres.',
      does: 'Dirige la LLC au quotidien (contrats, banque, décisions courantes).',
      required: 'optional',
      ring: 0,
      details: `# Le manager

Le **manager** dirige la LLC au quotidien : signature des contrats, relation avec la banque, décisions courantes.

## Deux modes de gestion
- **Member-managed** : les membres gèrent eux-mêmes la LLC. C’est le cas le plus simple et le plus courant pour un entrepreneur seul.
- **Manager-managed** : les membres désignent un **manager**, qui peut être un membre ou une personne extérieure.

Le mode choisi est inscrit dans l’Operating Agreement (et parfois dans les Articles of Organization).`,
    },
    {
      id: 'registered-agent',
      kind: 'card',
      cluster: 'roles',
      title: 'Registered Agent',
      role: 'Registered Agent',
      icon: 'mail',
      who: 'Une personne ou une société disposant d’une adresse physique dans l’État.',
      does: 'Reçoit les courriers officiels et les actes juridiques au nom de la LLC.',
      required: 'required',
      ring: 0,
      details: `# Le Registered Agent

Le **Registered Agent** est le point de contact officiel de la LLC dans son État de création.

- Il dispose d’une **adresse physique** dans l’État (pas une boîte postale).
- Il **reçoit les courriers officiels** de l’administration et les **actes juridiques** (une assignation, par exemple), puis les transmet au membre.
- Il est **obligatoire** : sans Registered Agent, la LLC ne peut pas être créée ni rester en règle.

Pour un non-résident, c’est généralement un prestataire spécialisé, à renouveler chaque année.`,
    },
    {
      id: 'organizer',
      kind: 'card',
      cluster: 'roles',
      title: 'Organizer',
      role: 'Organizer',
      icon: 'file-signature',
      who: 'Souvent le prestataire de création, parfois le membre lui-même.',
      does: 'Dépose les Articles of Organization auprès de l’État.',
      required: 'required',
      ring: 1,
      details: `# L’organizer

L’**organizer** est la personne qui **dépose les Articles of Organization** auprès du Secretary of State pour faire naître la LLC.

- Ce rôle est purement **administratif** et s’arrête une fois la LLC créée.
- Souvent, c’est le **prestataire de création** qui signe en tant qu’organizer.
- L’organizer n’est **pas** forcément membre et n’a aucun droit sur la LLC.`,
    },
    {
      id: 'secretary-of-state',
      kind: 'card',
      cluster: 'roles',
      title: 'Secretary of State',
      role: 'Secretary of State',
      icon: 'landmark',
      who: 'L’administration de l’État où la LLC est créée.',
      does: 'Enregistre la LLC, délivre les certificats et reçoit l’annual report.',
      required: 'external',
      ring: 1,
      details: `# Le Secretary of State

Le **Secretary of State** est l’administration de l’État qui tient le **registre des sociétés**.

- Il **enregistre la LLC** à réception des Articles of Organization.
- Il **reçoit l’annual report** (ou l’équivalent prévu par l’État) chaque année.
- Il délivre le **Certificate of Good Standing**, qui atteste que la LLC est en règle.

C’est l’équivalent, pour un francophone, du greffe ou du registre du commerce, mais au niveau de l’État.`,
    },
    {
      id: 'irs',
      kind: 'card',
      cluster: 'roles',
      title: 'IRS',
      role: 'IRS',
      icon: 'scale',
      who: 'L’administration fiscale fédérale des États-Unis.',
      does: 'Délivre l’EIN et reçoit les déclarations fédérales de la LLC.',
      required: 'external',
      ring: 1,
      details: `# L’IRS

L’**IRS** (*Internal Revenue Service*) est l’administration fiscale **fédérale** américaine.

- Il **délivre l’EIN**, le numéro d’identification fiscal de la LLC.
- Il **reçoit les déclarations fédérales**, notamment le Form 5472 accompagné du 1120 pro forma pour une LLC à membre unique étranger.
- Il n’intervient pas dans la création de la LLC : c’est le rôle de l’État.`,
    },
    {
      id: 'schema-orgchart',
      kind: 'schema',
      cluster: 'roles',
      title: 'Qui fait quoi',
      schema: 'orgchart',
      caption: 'Les acteurs autour de la LLC : propriétaires, direction, adresse officielle, administrations.',
      size: 'lg',
      ring: 1,
      details: `# Organigramme d’une LLC

- Le ou les **membres** possèdent la LLC.
- Un **manager** (optionnel) peut diriger au quotidien à la place des membres.
- Le **Registered Agent** est l’adresse officielle de la LLC dans l’État.
- Le **Secretary of State** enregistre la LLC et reçoit l’annual report.
- L’**IRS** délivre l’EIN et reçoit les déclarations fédérales.`,
    },
    {
      id: 'photo-mailbox',
      kind: 'photo',
      cluster: 'roles',
      title: 'Une vraie adresse dans l’État',
      imageQuery: 'office building entrance minimal architecture',
      caption: 'Le Registered Agent, c’est une adresse physique dans l’État, pas une boîte postale.',
      icon: 'mail',
      ring: 2,
      details: `# Une adresse physique dans l’État

Le Registered Agent doit avoir une **adresse physique** dans l’État de création de la LLC, ouverte aux heures de bureau, pour recevoir les courriers officiels et les actes juridiques.

Pour un entrepreneur non-résident, c’est généralement un prestataire spécialisé qui remplit ce rôle.`,
    },

    /* ─────────────────────────── C. Les documents ─────────────────────────── */
    {
      id: 'articles',
      kind: 'sticky',
      cluster: 'documents',
      title: 'Articles of Organization',
      body: 'L’acte de naissance de la LLC, déposé auprès de l’État.',
      tint: 'sky',
      ring: 0,
      details: `# Les Articles of Organization

C’est l’**acte de naissance** de la LLC. Ce document est déposé par l’organizer auprès du **Secretary of State**.

## Ce qu’il contient
- le **nom** de la LLC ;
- l’adresse et le nom du **Registered Agent** ;
- parfois le mode de gestion (member-managed ou manager-managed) et le nom de l’organizer.

Une fois acceptés par l’État, les Articles font officiellement exister la LLC.`,
    },
    {
      id: 'operating-agreement',
      kind: 'sticky',
      cluster: 'documents',
      title: 'Operating Agreement',
      body: 'Les règles internes : parts, décisions, distributions.',
      tint: 'indigo',
      ring: 0,
      details: `# L’Operating Agreement

L’**Operating Agreement** est le **contrat interne** de la LLC. Il fixe les règles du jeu entre les membres (et avec le manager, s’il y en a un).

## Ce qu’il organise
- la **répartition des parts** entre les membres ;
- la manière de **prendre les décisions** ;
- les **distributions** de bénéfices ;
- l’entrée ou la sortie d’un membre, la gestion au quotidien.

Même pour une LLC à membre unique, il est fortement recommandé : il prouve que la LLC est une entité distincte de son propriétaire, et il est souvent demandé par les banques.`,
    },
    {
      id: 'ein',
      kind: 'sticky',
      cluster: 'documents',
      title: 'EIN',
      body: 'Le numéro fiscal fédéral de la LLC, délivré par l’IRS.',
      tint: 'slate',
      size: 'sm',
      ring: 0,
      details: `# L’EIN

L’**EIN** (*Employer Identification Number*) est le **numéro d’identification fiscal fédéral** de la LLC, délivré par l’IRS.

Il est indispensable pour :
- ouvrir un **compte bancaire** au nom de la LLC ;
- utiliser des **outils de paiement** (Stripe, PayPal) ;
- déposer les **déclarations fédérales**.

Malgré son nom, il n’oblige pas à avoir des salariés.`,
    },
    {
      id: 'good-standing',
      kind: 'sticky',
      cluster: 'documents',
      title: 'Certificate of Good Standing',
      body: 'L’attestation de l’État que la LLC est en règle.',
      tint: 'mint',
      ring: 1,
      details: `# Le Certificate of Good Standing

Le **Certificate of Good Standing** est délivré par le **Secretary of State**. Il atteste que la LLC est **en règle** : annual report déposé, frais de l’État payés, Registered Agent à jour.

Il est souvent demandé par une banque, un partenaire ou une plateforme de paiement pour vérifier que la LLC existe toujours et qu’elle est active.`,
    },
    {
      id: 'schema-timeline',
      kind: 'schema',
      cluster: 'documents',
      title: 'Les étapes de création',
      schema: 'timeline',
      caption: 'De l’État choisi aux outils de paiement : l’ordre dans lequel tout se met en place.',
      size: 'lg',
      ring: 1,
      details: `# La création, étape par étape

1. **Choix de l’État** : chaque État a ses règles et ses coûts ; le choix dépend de la situation.
2. **Articles of Organization** : dépôt auprès du Secretary of State, la LLC existe.
3. **EIN** : demande du numéro fiscal fédéral auprès de l’IRS.
4. **Operating Agreement** : rédaction des règles internes.
5. **Compte bancaire** : ouverture au nom de la LLC, souvent dans une néobanque.
6. **Outils de paiement** : Stripe, PayPal ou équivalent pour encaisser les clients.`,
    },
    {
      id: 'photo-contract',
      kind: 'photo',
      cluster: 'documents',
      title: 'Le contrat interne',
      imageQuery: 'contract document signature desk minimal',
      caption: 'L’Operating Agreement : des règles écrites, même seul.',
      icon: 'file-signature',
      ring: 2,
      details: `# Des règles écrites, même seul

L’Operating Agreement est un document **privé** : il n’est pas déposé auprès de l’État. Mais il est la preuve que la LLC fonctionne comme une entité distincte, avec ses propres règles.

Les banques et certains partenaires le demandent régulièrement.`,
    },
    {
      id: 'remember-docs',
      kind: 'callout',
      cluster: 'documents',
      title: 'Trois documents, trois rôles',
      variant: 'remember',
      body: 'Articles : la naissance. Operating Agreement : les règles. EIN : l’identité fiscale.',
      ring: 2,
      details: `# À retenir : trois documents, trois rôles

- **Articles of Organization** : la LLC **naît**. Déposés auprès de l’État.
- **Operating Agreement** : la LLC a des **règles**. Document interne, privé.
- **EIN** : la LLC a une **identité fiscale**. Délivré par l’IRS.

Et pour prouver que tout est en ordre : le **Certificate of Good Standing**.`,
    },

    /* ─────────────────────────── D. Fonctionnement ────────────────────────── */
    {
      id: 'invoice',
      kind: 'sticky',
      cluster: 'operations',
      title: 'Facturer partout',
      body: 'La LLC facture des clients dans le monde entier, en son nom.',
      tint: 'mint',
      ring: 0,
      details: `# Facturer des clients partout dans le monde

La LLC émet ses **factures en son nom** et peut travailler avec des clients situés dans n’importe quel pays.

- Les contrats sont signés **par la LLC**, pas par le membre.
- Les paiements arrivent sur le **compte bancaire de la LLC**.

C’est ce qui en fait une structure adaptée aux activités digitales : conseil, freelance, SaaS, e-commerce, formation.`,
    },
    {
      id: 'bank',
      kind: 'sticky',
      cluster: 'operations',
      title: 'Compte bancaire US',
      body: 'Un compte au nom de la LLC, souvent ouvert dans une néobanque.',
      tint: 'sky',
      ring: 0,
      details: `# Le compte bancaire américain

La LLC dispose de son propre **compte bancaire aux États-Unis**, ouvert à son nom grâce à l’EIN et aux documents de création.

- Pour un non-résident, les **néobanques** sont souvent la voie la plus accessible.
- Ce compte reçoit les paiements des clients et sert à payer les dépenses **de la LLC**.
- Il doit rester **strictement séparé** des comptes personnels du membre.`,
    },
    {
      id: 'payments',
      kind: 'sticky',
      cluster: 'operations',
      title: 'Stripe, PayPal',
      body: 'Les outils de paiement s’ouvrent au nom de la LLC, avec l’EIN.',
      tint: 'indigo',
      size: 'sm',
      ring: 1,
      details: `# Les outils de paiement

Avec une LLC, l’EIN et un compte bancaire américain, il devient possible d’ouvrir des comptes **Stripe**, **PayPal** ou équivalents au nom de la LLC.

Ces outils encaissent les paiements par carte des clients et les reversent sur le compte bancaire de la LLC.`,
    },
    {
      id: 'tax-default',
      kind: 'sticky',
      cluster: 'operations',
      title: 'Transparente par défaut',
      body: 'Membre unique : disregarded entity. Plusieurs membres : partnership. Option corporation possible.',
      tint: 'slate',
      ring: 0,
      details: `# Fiscalement transparente par défaut

Par défaut, la LLC ne paie pas l’impôt sur les sociétés elle-même : son résultat est attribué à ses membres.

## Selon le nombre de membres
- **Un seul membre** : la LLC est une **disregarded entity**, c’est-à-dire « ignorée » fiscalement. Tout est rattaché au membre.
- **Plusieurs membres** : la LLC est traitée comme un **partnership**.

## L’option corporation
Dans certains cas, la LLC peut **choisir** d’être imposée comme une corporation. Ce choix se fait sur option, après analyse de la situation : il n’est pas automatique et n’est pas toujours pertinent.`,
    },
    {
      id: 'residence-tax',
      kind: 'sticky',
      cluster: 'operations',
      title: 'Imposé dans son pays',
      body: 'Le membre est imposé selon les règles de son pays de résidence fiscale.',
      tint: 'mint',
      ring: 1,
      details: `# Où le membre est-il imposé ?

Parce que la LLC est transparente, le résultat « traverse » jusqu’au **membre**. Celui-ci est alors imposé **selon les règles de son pays de résidence fiscale** : France, Belgique, Suisse, Émirats, Portugal, etc.

> La LLC ne fait pas disparaître l’impôt : **elle le déplace** vers le pays où vit le membre. C’est ce pays, et sa convention fiscale éventuelle avec les États-Unis, qui détermine ce qui est dû.

C’est pour cela que le choix de la résidence fiscale compte au moins autant que le choix de la structure.`,
    },
    {
      id: 'schema-moneyflow',
      kind: 'schema',
      cluster: 'operations',
      title: 'Le circuit de l’argent',
      schema: 'moneyflow',
      caption: 'Du client jusqu’à l’impôt dans le pays de résidence du membre.',
      size: 'lg',
      ring: 1,
      details: `# Le circuit de l’argent

1. Le **client** reçoit une **facture** émise par la LLC.
2. Il paie sur le **compte bancaire américain** de la LLC (directement ou via Stripe, PayPal).
3. La LLC règle ses dépenses, puis **distribue** le reste au membre.
4. Le **membre** déclare ce revenu et est **imposé dans son pays de résidence fiscale**.`,
    },
    {
      id: 'schema-passthrough',
      kind: 'schema',
      cluster: 'operations',
      title: 'La transparence fiscale',
      schema: 'passthrough',
      caption: 'La LLC ne paie pas l’impôt elle-même : le résultat traverse jusqu’au membre.',
      size: 'md',
      ring: 2,
      details: `# La transparence fiscale, en image

La LLC est comme une **vitre** : le résultat de l’activité la traverse sans y être imposé, et arrive directement chez le **membre**.

C’est ensuite le pays de résidence fiscale du membre qui applique ses propres règles sur ce revenu.`,
    },
    {
      id: 'photo-bank',
      kind: 'photo',
      cluster: 'operations',
      title: 'La banque',
      imageQuery: 'modern bank building glass facade',
      caption: 'Un compte au nom de la LLC, séparé des comptes personnels.',
      icon: 'landmark',
      ring: 2,
      details: `# Un compte au nom de la LLC

Le compte bancaire est ouvert **au nom de la LLC**, pas au nom du membre. C’est l’une des conditions pour que la responsabilité limitée reste effective.

Pour un non-résident, les néobanques spécialisées sont généralement la voie la plus simple.`,
    },
    {
      id: 'photo-laptop',
      kind: 'photo',
      cluster: 'operations',
      title: 'Travailler de n’importe où',
      imageQuery: 'laptop desk minimal workspace window',
      caption: 'Une activité digitale, des clients partout, une structure américaine.',
      icon: 'globe',
      ring: 2,
      details: `# Une structure pour les activités digitales

Conseil, freelance, SaaS, formation en ligne, e-commerce : la LLC permet de facturer des clients dans le monde entier tout en vivant hors des États-Unis.

Le membre travaille d’où il veut ; c’est son pays de résidence fiscale qui l’impose.`,
    },

    /* ──────────────────────── E. Obligations récurrentes ──────────────────── */
    {
      id: 'annual-report',
      kind: 'sticky',
      cluster: 'obligations',
      title: 'Annual report',
      body: 'Un rapport ou une taxe annuelle à déposer auprès de l’État, selon l’État.',
      tint: 'slate',
      ring: 0,
      details: `# L’annual report ou la taxe annuelle de l’État

Chaque année, la LLC doit se manifester auprès de son **État de création** pour rester en règle.

- Selon l’État, il s’agit d’un **annual report** (une mise à jour des informations de la LLC) ou d’une **taxe annuelle**, parfois des deux.
- Le dépôt se fait auprès du **Secretary of State**.
- Un oubli peut entraîner la perte du Good Standing, puis la **dissolution administrative** de la LLC.`,
    },
    {
      id: 'form-5472',
      kind: 'sticky',
      cluster: 'obligations',
      title: 'Form 5472 + 1120 pro forma',
      body: 'La déclaration fédérale annuelle d’une LLC à membre unique étranger.',
      tint: 'indigo',
      ring: 0,
      details: `# Form 5472 et 1120 pro forma

Une LLC à **membre unique étranger** (non-résident américain) doit déposer chaque année auprès de l’IRS :

- le **Form 5472**, qui déclare les transactions entre la LLC et son propriétaire étranger (apports, distributions, prêts, etc.) ;
- accompagné d’un **Form 1120 pro forma**, une page de couverture qui identifie la LLC.

Ce n’est pas une déclaration d’impôt à payer : c’est une **déclaration d’information**. Mais l’oubli est lourdement pénalisé.`,
    },
    {
      id: 'bookkeeping',
      kind: 'sticky',
      cluster: 'obligations',
      title: 'Comptabilité',
      body: 'Tenir les comptes de la LLC : factures, dépenses, distributions.',
      tint: 'sky',
      size: 'sm',
      ring: 1,
      details: `# La comptabilité

Même simple, la comptabilité de la LLC doit être **tenue à jour** :

- les factures émises et les paiements reçus ;
- les dépenses de la LLC ;
- les apports et les distributions au membre.

Elle sert à préparer le Form 5472, à justifier la séparation entre la LLC et le membre, et à déclarer correctement le revenu dans le pays de résidence.`,
    },
    {
      id: 'ra-renewal',
      kind: 'sticky',
      cluster: 'obligations',
      title: 'Registered Agent à jour',
      body: 'Le Registered Agent se renouvelle chaque année.',
      tint: 'mint',
      size: 'sm',
      ring: 1,
      details: `# Garder un Registered Agent à jour

Le Registered Agent est obligatoire **en permanence**, pas seulement à la création.

- Le service se **renouvelle chaque année** auprès du prestataire.
- Si la LLC n’a plus de Registered Agent, elle perd son Good Standing et risque la dissolution.`,
    },
    {
      id: 'schema-calendar',
      kind: 'schema',
      cluster: 'obligations',
      title: 'Le calendrier annuel',
      schema: 'calendar',
      caption: 'Ce qui revient chaque année : État, IRS, Registered Agent.',
      size: 'lg',
      ring: 1,
      details: `# Le calendrier annuel

Chaque année, trois rendez-vous reviennent :

- **Auprès de l’État** : annual report ou taxe annuelle, selon l’État de création.
- **Auprès de l’IRS** : Form 5472 accompagné du 1120 pro forma, pour une LLC à membre unique étranger.
- **Auprès du Registered Agent** : renouvellement du service.

Et en continu : la comptabilité de la LLC.`,
    },
    {
      id: 'photo-documents',
      kind: 'photo',
      cluster: 'obligations',
      title: 'Les formalités',
      imageQuery: 'paper documents folder office desk',
      caption: 'Des formalités légères, mais à ne jamais oublier.',
      icon: 'calendar',
      ring: 2,
      details: `# Des formalités légères, mais régulières

Une LLC demande peu de formalités, mais celles qui existent sont **annuelles** et **non négociables** : annual report ou taxe de l’État, Form 5472 avec 1120 pro forma, renouvellement du Registered Agent, comptabilité.`,
    },

    /* ────────────────────────────── F. Pièges ─────────────────────────────── */
    {
      id: 'pitfall-tax-free',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'LLC = zéro impôt ?',
      variant: 'warning',
      body: 'Non. La LLC ne fait pas disparaître l’impôt : elle le déplace vers le pays de résidence du membre.',
      ring: 0,
      details: `# Confondre LLC et exonération d’impôt

C’est le malentendu le plus fréquent. La LLC est **fiscalement transparente** : elle ne paie pas l’impôt elle-même, le résultat « traverse » jusqu’au membre.

Le membre est ensuite **imposé selon les règles de son pays de résidence fiscale**. La LLC ne fait donc pas disparaître l’impôt : **elle le déplace**.

> Créer une LLC sans réfléchir à sa propre résidence fiscale, c’est résoudre la moitié du problème.`,
    },
    {
      id: 'pitfall-no-oa',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'Pas d’Operating Agreement',
      variant: 'warning',
      body: 'Sans règles écrites, la séparation entre la LLC et son membre est fragile.',
      ring: 0,
      details: `# Se passer d’Operating Agreement

Certains États ne l’exigent pas. Pourtant, s’en passer est une erreur :

- sans règles écrites, la **séparation** entre la LLC et le membre est plus difficile à démontrer ;
- les **banques** et certains partenaires le demandent ;
- à plusieurs membres, c’est le seul document qui fixe **qui décide quoi** et **qui reçoit quoi**.`,
    },
    {
      id: 'pitfall-5472',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'Oublier le Form 5472',
      variant: 'warning',
      body: 'Déclaration d’information obligatoire chaque année. Les pénalités en cas d’oubli sont lourdes.',
      ring: 1,
      details: `# Oublier le Form 5472

Pour une LLC à membre unique étranger, le **Form 5472** (avec son **1120 pro forma**) est une déclaration **annuelle obligatoire** auprès de l’IRS, même sans activité.

- Ce n’est pas un impôt à payer, mais une déclaration d’information.
- L’oubli ou le retard entraîne des **pénalités lourdes**.

C’est l’obligation la plus souvent négligée par les entrepreneurs non-résidents.`,
    },
    {
      id: 'pitfall-commingling',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'Mélanger les comptes',
      variant: 'warning',
      body: 'Argent perso et argent de la LLC ne doivent jamais se mélanger.',
      ring: 1,
      details: `# Mélanger argent personnel et argent de la LLC

Payer ses courses avec la carte de la LLC, encaisser un client sur son compte personnel : c’est ce qu’on appelle le **commingling**.

## Pourquoi c’est dangereux
- La **responsabilité limitée** repose sur la séparation entre la LLC et son membre. Mélanger les comptes fragilise cette protection.
- La **comptabilité** et le **Form 5472** deviennent impossibles à tenir proprement.

> Une règle simple : tout ce qui concerne la LLC passe par le compte de la LLC. Le membre se verse des **distributions**, clairement identifiées.`,
    },
    {
      id: 'pitfall-state',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'Choisir l’État au hasard',
      variant: 'warning',
      body: 'Wyoming, Delaware, New Mexico : ils ne se valent pas selon la situation.',
      ring: 1,
      details: `# Choisir l’État sans réfléchir

Wyoming, Delaware, New Mexico, Floride : chaque État a ses propres règles sur les frais, l’annual report, la confidentialité des membres ou la réputation auprès des banques et des investisseurs.

- **Ils ne se valent pas** : le bon choix dépend de l’activité, du nombre de membres, du besoin de confidentialité et des projets de levée de fonds.
- Copier le choix d’un autre entrepreneur, sans analyse, est l’erreur classique.`,
    },
  ],
  edges: [
    /* core */
    { id: 'e-llc-hybrid', source: 'llc', target: 'hybrid', cluster: 'core' },
    { id: 'e-llc-liability', source: 'llc', target: 'liability', label: 'protège', cluster: 'core' },
    { id: 'e-llc-no-residence', source: 'llc', target: 'no-residence', cluster: 'core' },
    { id: 'e-llc-flexible', source: 'llc', target: 'flexible', cluster: 'core' },
    { id: 'e-llc-skyline', source: 'llc', target: 'photo-skyline', label: 'créée dans un État', cluster: 'core' },

    /* rôles */
    { id: 'e-member-llc', source: 'member', target: 'llc', label: 'possède', cluster: 'roles' },
    { id: 'e-manager-llc', source: 'manager', target: 'llc', label: 'dirige', cluster: 'roles' },
    { id: 'e-ra-llc', source: 'registered-agent', target: 'llc', label: 'adresse officielle', cluster: 'roles' },
    { id: 'e-organizer-articles', source: 'organizer', target: 'articles', label: 'dépose', cluster: 'roles' },
    { id: 'e-sos-llc', source: 'secretary-of-state', target: 'llc', label: 'enregistre', cluster: 'roles' },
    { id: 'e-irs-ein', source: 'irs', target: 'ein', label: 'délivre', cluster: 'roles' },
    { id: 'e-member-manager', source: 'member', target: 'manager', label: 'désigne', cluster: 'roles' },
    { id: 'e-llc-orgchart', source: 'llc', target: 'schema-orgchart', cluster: 'roles' },
    { id: 'e-ra-mailbox', source: 'registered-agent', target: 'photo-mailbox', cluster: 'roles' },

    /* documents */
    { id: 'e-articles-llc', source: 'articles', target: 'llc', label: 'crée', cluster: 'documents' },
    { id: 'e-oa-llc', source: 'operating-agreement', target: 'llc', label: 'organise', cluster: 'documents' },
    { id: 'e-ein-llc', source: 'ein', target: 'llc', label: 'identifie', cluster: 'documents' },
    { id: 'e-sos-good-standing', source: 'secretary-of-state', target: 'good-standing', label: 'délivre', cluster: 'documents' },
    { id: 'e-llc-timeline', source: 'llc', target: 'schema-timeline', cluster: 'documents' },
    { id: 'e-contract-oa', source: 'photo-contract', target: 'operating-agreement', cluster: 'documents' },
    { id: 'e-remember-docs-articles', source: 'remember-docs', target: 'articles', cluster: 'documents' },

    /* au quotidien */
    { id: 'e-llc-invoice', source: 'llc', target: 'invoice', label: 'facture', cluster: 'operations' },
    { id: 'e-invoice-bank', source: 'invoice', target: 'bank', label: 'encaisse', cluster: 'operations' },
    { id: 'e-payments-bank', source: 'payments', target: 'bank', label: 'reverse', cluster: 'operations' },
    { id: 'e-llc-member-distribution', source: 'llc', target: 'member', label: 'verse', cluster: 'operations' },
    { id: 'e-llc-tax-default', source: 'llc', target: 'tax-default', cluster: 'operations' },
    { id: 'e-tax-default-residence', source: 'tax-default', target: 'residence-tax', label: 'le résultat traverse', cluster: 'operations' },
    { id: 'e-llc-moneyflow', source: 'llc', target: 'schema-moneyflow', cluster: 'operations' },
    { id: 'e-tax-default-passthrough', source: 'tax-default', target: 'schema-passthrough', cluster: 'operations' },
    { id: 'e-bank-photo', source: 'bank', target: 'photo-bank', cluster: 'operations' },
    { id: 'e-invoice-laptop', source: 'invoice', target: 'photo-laptop', cluster: 'operations' },

    /* chaque année */
    { id: 'e-annual-sos', source: 'annual-report', target: 'secretary-of-state', label: 'déclare à', cluster: 'obligations' },
    { id: 'e-5472-irs', source: 'form-5472', target: 'irs', label: 'déclare à', cluster: 'obligations' },
    { id: 'e-bookkeeping-llc', source: 'bookkeeping', target: 'llc', cluster: 'obligations' },
    { id: 'e-ra-renewal', source: 'ra-renewal', target: 'registered-agent', label: 'renouvelle', cluster: 'obligations' },
    { id: 'e-llc-calendar', source: 'llc', target: 'schema-calendar', label: 'chaque année', cluster: 'obligations' },
    { id: 'e-calendar-photo', source: 'schema-calendar', target: 'photo-documents', cluster: 'obligations' },

    /* pièges */
    { id: 'e-pitfall-tax-free', source: 'pitfall-tax-free', target: 'residence-tax', cluster: 'pitfalls' },
    { id: 'e-pitfall-no-oa', source: 'pitfall-no-oa', target: 'operating-agreement', cluster: 'pitfalls' },
    { id: 'e-pitfall-5472', source: 'pitfall-5472', target: 'form-5472', cluster: 'pitfalls' },
    { id: 'e-pitfall-commingling', source: 'pitfall-commingling', target: 'bank', cluster: 'pitfalls' },
    { id: 'e-pitfall-state', source: 'pitfall-state', target: 'photo-skyline', cluster: 'pitfalls' },
    { id: 'e-llc-pitfalls', source: 'llc', target: 'pitfall-tax-free', label: 'attention', cluster: 'pitfalls' },
  ],
};
