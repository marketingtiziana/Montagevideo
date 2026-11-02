import type { Mindmap } from '@/data/types';

/**
 * Source de vérité du contenu de la mindmap « Comment fonctionne une LLC ».
 * Aucun chiffre, aucun montant : uniquement des mécanismes et des rôles.
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
    {
      id: 'llc',
      kind: 'sticky',
      cluster: 'core',
      title: 'LLC',
      body: 'Limited Liability Company : une société créée au niveau d’un État américain.',
      tint: 'indigo',
      size: 'lg',
      details: `# C’est quoi une LLC ?

**LLC** signifie *Limited Liability Company*. C’est une entité juridique créée au niveau d’un **État américain** (et non au niveau fédéral).

## Un hybride
La LLC emprunte à deux mondes :
- à la **société** : la responsabilité limitée, qui protège le patrimoine personnel du propriétaire ;
- au **partnership** : la souplesse de fonctionnement et la transparence fiscale par défaut.

## Ce qu’il faut retenir
- Le patrimoine personnel du membre est **séparé** de celui de la LLC.
- Elle est **très flexible** : peu de formalisme, règles internes librement définies.
- **Aucune obligation de résider aux États-Unis** pour en créer une ou en être propriétaire.`,
    },
    {
      id: 'member',
      kind: 'card',
      cluster: 'roles',
      title: 'Membre',
      role: 'Membre (member)',
      icon: 'user',
      who: 'Le propriétaire de la LLC. Un ou plusieurs, personne physique ou morale.',
      does: 'Détient les parts et perçoit les distributions.',
      required: 'required',
      ring: 0,
      details: `# Le membre (member)

Le **membre** est le **propriétaire** de la LLC. Il peut y en avoir un seul (*single-member LLC*) ou plusieurs (*multi-member LLC*).

- Un membre peut être une **personne physique** ou une **personne morale** (une autre société).
- Il perçoit les **distributions**, c’est-à-dire la part des bénéfices que la LLC lui verse.
- Ses droits et obligations sont décrits dans l’**Operating Agreement**.

> Être membre ne demande ni nationalité américaine, ni résidence aux États-Unis.`,
    },
    {
      id: 'photo-skyline',
      kind: 'photo',
      cluster: 'core',
      title: 'Une entité créée dans un État',
      imageQuery: 'new york skyline blue sky office buildings',
      caption: 'La LLC naît dans un État américain, pas au niveau fédéral.',
      icon: 'building',
      size: 'md',
      details: `# Une création au niveau d’un État

Aux États-Unis, ce sont les **États** (Wyoming, Delaware, New Mexico, Floride, etc.) qui créent les sociétés, pas le gouvernement fédéral.

C’est donc auprès du **Secretary of State** de l’État choisi que la LLC est enregistrée. Le niveau fédéral (l’**IRS**) intervient ensuite pour la fiscalité.`,
    },
    {
      id: 'schema-orgchart',
      kind: 'schema',
      cluster: 'roles',
      title: 'Qui fait quoi',
      schema: 'orgchart',
      caption: 'Les acteurs autour de la LLC.',
      size: 'lg',
      ring: 1,
      details: `# Organigramme d’une LLC

- Le ou les **membres** possèdent la LLC.
- Un **manager** (optionnel) peut diriger au quotidien à la place des membres.
- Le **Registered Agent** est l’adresse officielle de la LLC dans l’État.
- Le **Secretary of State** enregistre la LLC ; l’**IRS** gère la fiscalité fédérale.`,
    },
    {
      id: 'pitfall-tax-free',
      kind: 'callout',
      cluster: 'pitfalls',
      title: 'Piège : LLC = zéro impôt ?',
      variant: 'warning',
      body: 'Une LLC ne fait pas disparaître l’impôt : elle le déplace vers le pays de résidence du membre.',
      ring: 0,
      details: `# Confondre LLC et exonération d’impôt

C’est le malentendu le plus fréquent. La LLC est **fiscalement transparente** : elle ne paie pas l’impôt elle-même, le résultat « traverse » jusqu’au membre.

Le membre est ensuite **imposé selon les règles de son pays de résidence fiscale**. La LLC ne fait donc pas disparaître l’impôt : **elle le déplace**.`,
    },
  ],
  edges: [
    { id: 'e-member-llc', source: 'member', target: 'llc', label: 'possède', cluster: 'roles' },
    { id: 'e-llc-skyline', source: 'llc', target: 'photo-skyline', cluster: 'core' },
    { id: 'e-llc-orgchart', source: 'llc', target: 'schema-orgchart', label: 'acteurs', cluster: 'roles' },
    { id: 'e-llc-pitfall', source: 'llc', target: 'pitfall-tax-free', label: 'attention', cluster: 'pitfalls' },
  ],
};
