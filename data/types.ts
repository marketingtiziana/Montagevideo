/**
 * Modèle de données de la mindmap « Comment fonctionne une LLC ».
 * Tout le contenu affiché par le board provient de `data/mindmap.ts`.
 */

export type ClusterId = 'core' | 'roles' | 'documents' | 'operations' | 'obligations' | 'pitfalls';

export interface Cluster {
  id: ClusterId;
  /** Libellé affiché dans la légende. */
  label: string;
  /** Couleur principale (liens, accents). */
  color: string;
  /** Teinte claire (fonds, badges). */
  soft: string;
}

export type NodeKind = 'sticky' | 'photo' | 'schema' | 'card' | 'callout';

export type StickyTint = 'indigo' | 'sky' | 'slate' | 'mint';

export type SchemaKind = 'orgchart' | 'moneyflow' | 'timeline' | 'calendar' | 'passthrough';

export type CalloutVariant = 'warning' | 'remember';

/** Noms d'icônes lucide autorisés (résolus dans `lib/icons.ts`). */
export type IconName =
  | 'building'
  | 'user'
  | 'users'
  | 'briefcase'
  | 'mail'
  | 'file-signature'
  | 'landmark'
  | 'banknote'
  | 'scroll'
  | 'hash'
  | 'badge-check'
  | 'globe'
  | 'credit-card'
  | 'calendar'
  | 'alert-triangle'
  | 'lightbulb'
  | 'shield'
  | 'map'
  | 'wallet'
  | 'scale'
  | 'image';

export type NodeSize = 'sm' | 'md' | 'lg';

interface BaseNode {
  id: string;
  cluster: ClusterId;
  /** Titre court affiché sur le board. */
  title: string;
  /** Explication complète (markdown) affichée dans le panneau latéral. */
  details: string;
  /** Taille indicative, utilisée par le layout et le rendu. */
  size?: NodeSize;
  /** Rang de placement : 0 = proche du centre, 1 = plus loin. Optionnel. */
  ring?: 0 | 1 | 2;
}

export interface StickyNodeData extends BaseNode {
  kind: 'sticky';
  body: string;
  tint: StickyTint;
}

export interface PhotoNodeData extends BaseNode {
  kind: 'photo';
  /** Requête envoyée à l'API Pexels par `scripts/fetch-images.ts`. */
  imageQuery: string;
  caption: string;
  /** Icône utilisée par le bloc de repli quand la photo n'est pas disponible. */
  icon: IconName;
}

export interface SchemaNodeData extends BaseNode {
  kind: 'schema';
  schema: SchemaKind;
  caption?: string;
}

export interface CardNodeData extends BaseNode {
  kind: 'card';
  icon: IconName;
  /** Nom du rôle (ex. « Registered Agent »). */
  role: string;
  /** Qui c'est. */
  who: string;
  /** Ce qu'il fait. */
  does: string;
  /** Obligatoire ou pas. */
  required: 'required' | 'optional' | 'external';
}

export interface CalloutNodeData extends BaseNode {
  kind: 'callout';
  variant: CalloutVariant;
  body: string;
}

export type MindmapNode = StickyNodeData | PhotoNodeData | SchemaNodeData | CardNodeData | CalloutNodeData;

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  /** Étiquette courte (« crée », « déclare à », « verse »). */
  label?: string;
  cluster: ClusterId;
}

export interface Mindmap {
  /** Graine du générateur pseudo-aléatoire : layout identique à chaque chargement. */
  seed: number;
  /** Identifiant du nœud central. */
  rootId: string;
  clusters: Cluster[];
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}
