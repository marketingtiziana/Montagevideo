/**
 * Modèle de données du board. Tout le contenu affiché vient de data/board.ts.
 */
export type Side = "left" | "right";

export type NoteTone = "indigo" | "sky" | "slate" | "mint";

export type IconName =
  | "users"
  | "user-cog"
  | "map-pin"
  | "file-signature"
  | "landmark"
  | "building"
  | "shield-check"
  | "globe"
  | "scroll"
  | "badge-check"
  | "receipt"
  | "calendar"
  | "wallet"
  | "briefcase"
  | "scale"
  | "lightbulb"
  | "alert-triangle"
  | "check-circle"
  | "x-circle"
  | "sparkles"
  | "pin"
  | "image";

export interface Branch {
  /** Petite étiquette sur la branche, ex. « crée », « verse ». */
  label?: string;
  /** Couleur de la branche si différente de celle de la section. */
  color?: string;
}

export type Annotation =
  | { kind: "circle"; anchor: string; color?: string; padding?: number }
  | { kind: "underline"; anchor: string; color?: string }
  | { kind: "arrow"; anchor: string; from: { dx: number; dy: number }; color?: string }
  | {
      kind: "note";
      text: string;
      /** Coin de l'élément où accrocher la note. */
      placement: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      dx?: number;
      dy?: number;
      rotate?: number;
      tone?: NoteTone;
      /** Flèche de la note vers un détail de l'élément. */
      arrowTo?: string;
      width?: number;
    };

interface ElementBase {
  id: string;
  side: Side;
  /** Largeur en px (260 à 480). Sinon tirée au sort selon le type. */
  width?: number;
  /** Rotation en degrés. Sinon tirée au sort entre -3 et 3. */
  rotate?: number;
  /** Empêche le regroupement avec l'élément voisin sur la même ligne. */
  solo?: boolean;
  branch?: Branch;
  annotations?: Annotation[];
}

export interface ScreenField {
  label: string;
  value: string;
  anchor?: string;
}

export type Screen =
  | {
      kind: "letter";
      agency: string;
      dept: string;
      date: string;
      ref: string;
      subject: string;
      greeting: string;
      paragraphs: string[];
      highlight: { label: string; value: string; anchor?: string };
    }
  | {
      kind: "email";
      from: string;
      to: string;
      subject: string;
      time: string;
      body: string[];
      attachment?: { name: string; anchor?: string };
    }
  | {
      kind: "document";
      state?: string;
      title: string;
      subtitle?: string;
      fields: ScreenField[];
      stamp?: string;
    }
  | {
      kind: "dashboard";
      app: string;
      account: string;
      balanceLabel: string;
      rows: { name: string; note: string; positive: boolean; anchor?: string }[];
    }
  | {
      kind: "notice";
      sender: string;
      badge: string;
      title: string;
      lines: string[];
      cta: string;
      deadline?: ScreenField;
    }
  | {
      kind: "form";
      formLabel: string;
      formNumber: string;
      title: string;
      subtitle: string;
      fields: ScreenField[];
      deadline: ScreenField;
    };

export interface ScreenshotElement extends ElementBase {
  type: "screenshot";
  /** Titre de fenêtre affiché dans la barre du faux écran. */
  window: string;
  screen: Screen;
}

export interface ChatMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface ChatElement extends ElementBase {
  type: "chat";
  contact: string;
  status: string;
  messages: ChatMessage[];
}

export interface MetricElement extends ElementBase {
  type: "metric";
  value: string;
  label: string;
  caption?: string;
  trend?: "up" | "down" | "flat";
}

export type ChartSpec =
  | {
      kind: "org";
      members: string;
      llc: string;
      manager: string;
      managerNote: string;
      agent: string;
      agentNote: string;
      sos: string;
      irs: string;
      edges: { owns: string; manages: string; registers: string; ein: string };
    }
  | { kind: "money"; steps: { label: string; sub?: string }[]; arrows: string[] }
  | { kind: "timeline"; steps: string[] }
  | { kind: "calendar"; items: { when: string; label: string }[] }
  | {
      kind: "transparency";
      llc: string;
      llcTax: string;
      member: string;
      memberTax: string;
      arrow: string;
    }
  | { kind: "funnel"; bars: { label: string; weight: number }[]; note: string };

export interface ChartElement extends ElementBase {
  type: "chart";
  title: string;
  chart: ChartSpec;
}

export interface PhotoElement extends ElementBase {
  type: "photo";
  /** Requête envoyée à Pexels par scripts/fetch-images.ts. */
  imageQuery: string;
  caption: string;
  /** Ratio largeur / hauteur. */
  aspect?: number;
  icon?: IconName;
}

export interface MemeElement extends ElementBase {
  type: "meme";
  caption?: string;
}

export interface CardElement extends ElementBase {
  type: "card";
  icon: IconName;
  name: string;
  who: string;
  does: string;
  required: string;
  requiredTone?: "yes" | "optional";
}

export interface CalloutElement extends ElementBase {
  type: "callout";
  tone: "trap" | "remember" | "bad" | "good";
  label: string;
  title: string;
  body?: string;
  points?: string[];
}

export type BoardElement =
  | ScreenshotElement
  | ChatElement
  | MetricElement
  | ChartElement
  | PhotoElement
  | MemeElement
  | CardElement
  | CalloutElement;

export interface ColumnHeader {
  title: string;
  color: string;
}

export interface Section {
  id: string;
  number: number;
  title: string;
  kicker?: string;
  /** Couleur des branches de la section. */
  color: string;
  /** Côté du titre par rapport au trait central. */
  side: Side;
  /** Section en deux colonnes (pièges) : les éléments sont appariés par ordre. */
  columns?: { left: ColumnHeader; right: ColumnHeader };
  elements: BoardElement[];
}

export interface BoardData {
  title: string;
  brand: string;
  sections: Section[];
  ui: {
    autoScroll: string;
    autoScrollStop: string;
    duration: string;
    exportPng: string;
    exporting: string;
    sectionMode: string;
    all: string;
    photoCredit: string;
    cardWho: string;
    cardDoes: string;
    end: string;
    seconds: string;
    hint: string;
  };
}

export interface BoardAssets {
  /** Fichiers présents dans public/board/memes, dans l'ordre. */
  memes: string[];
  /** Photos téléchargées : id -> crédit. */
  photos: Record<string, { photographer: string; url: string }>;
}
