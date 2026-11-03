import type { Edge, Node } from '@xyflow/react';
import { board, type BoardElement } from '@/data/board';
import { hashSeed } from '@/lib/random';

export interface ElementNodeData extends Record<string, unknown> {
  el: BoardElement;
}

export type ElementNode = Node<ElementNodeData, 'element'>;
export type LinesNode = Node<Record<string, never>, 'lines'>;
export type BoardNode = ElementNode | LinesNode;

export const LINES_NODE_ID = '__lines__';

export function buildNodes(elements: BoardElement[]): BoardNode[] {
  const lines: LinesNode = {
    id: LINES_NODE_ID,
    type: 'lines',
    position: { x: 0, y: 0 },
    data: {},
    draggable: false,
    selectable: false,
    focusable: false,
    zIndex: -10,
  };
  const nodes: BoardNode[] = elements.map((el) => ({
    id: el.id,
    type: 'element',
    position: { x: el.x, y: el.y },
    data: { el },
    draggable: true,
    selectable: true,
    zIndex: el.z ?? 1,
    style: { width: el.width },
  }));
  return [lines, ...nodes];
}

export function buildEdges(): Edge[] {
  return board.arrows.map((a) => ({
    id: a.id,
    source: a.from,
    target: a.to,
    type: 'rough',
    data: { color: board.arrowColor, ink: board.arrowColor, seed: hashSeed(a.id) },
  }));
}
