import type { BoardElement, Section, Side } from "@/data/types";
import { rngFor } from "./rng";

export const BOARD_WIDTH = 1080;
export const SPINE_X = BOARD_WIDTH / 2;
export const MIN_WIDTH = 260;
export const MAX_WIDTH = 480;

const WIDTH_BY_TYPE: Record<BoardElement["type"], [number, number]> = {
  screenshot: [400, 480],
  chat: [340, 400],
  metric: [260, 330],
  chart: [430, 480],
  photo: [300, 400],
  meme: [280, 340],
  card: [330, 400],
  callout: [340, 440],
};

export interface Placed {
  el: BoardElement;
  side: Side;
  width: number;
  rotate: number;
  /** Écart entre le bord de l'élément et le trait central (peut être négatif : chevauchement). */
  gap: number;
  /** Décalage vertical de l'élément dans sa ligne. */
  stagger: number;
}

export interface Row {
  key: string;
  left?: Placed;
  right?: Placed;
  /** Marge au-dessus de la ligne (négative : chevauchement avec la ligne précédente). */
  marginTop: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function placeElement(el: BoardElement, sectionId: string, staggered: boolean): Placed {
  const r = rngFor(`${sectionId}/${el.id}`);
  const [wMin, wMax] = WIDTH_BY_TYPE[el.type];
  const width = clamp(el.width ?? Math.round(r.range(wMin, wMax)), MIN_WIDTH, MAX_WIDTH);
  const rotate = el.rotate ?? Math.round(r.range(-3, 3) * 10) / 10;
  // Écart au trait central : le plus souvent net (place pour la branche et son étiquette),
  // parfois un léger chevauchement du trait. Toujours contenu dans le board.
  const maxGap = SPINE_X - width - 12;
  const rawGap = r.next() < 0.15 ? r.range(-24, 12) : r.range(56, 150);
  const gap = Math.round(Math.min(rawGap, maxGap));
  const stagger = staggered ? Math.round(r.range(40, 170)) : Math.round(r.range(0, 30));
  return { el, side: el.side, width, rotate, gap, stagger };
}

/**
 * Regroupe les éléments en lignes : deux éléments voisins de côtés opposés
 * partagent une ligne (décalés verticalement), sauf si l'un est `solo`.
 */
export function layoutSection(section: Section): Row[] {
  const rows: Row[] = [];
  const els = section.elements;
  let i = 0;
  let rowIndex = 0;
  while (i < els.length) {
    const a = els[i];
    const b = els[i + 1];
    const r = rngFor(`${section.id}/row/${rowIndex}`);
    const marginTop = rowIndex === 0 ? 24 : Math.round(r.range(-36, 44));
    const canPair = b && a.side !== b.side && !a.solo && !b.solo;
    if (canPair) {
      const staggerSide: Side = r.next() < 0.5 ? "left" : "right";
      const pa = placeElement(a, section.id, a.side === staggerSide);
      const pb = placeElement(b, section.id, b.side === staggerSide);
      rows.push({
        key: `${section.id}/${a.id}+${b.id}`,
        left: a.side === "left" ? pa : pb,
        right: a.side === "right" ? pa : pb,
        marginTop,
      });
      i += 2;
    } else {
      const pa = placeElement(a, section.id, false);
      rows.push({
        key: `${section.id}/${a.id}`,
        left: a.side === "left" ? pa : undefined,
        right: a.side === "right" ? pa : undefined,
        marginTop,
      });
      i += 1;
    }
    rowIndex += 1;
  }
  return rows;
}
