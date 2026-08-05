/** inserts/index.ts — registre des templates d'insert. */
export { CollageSubject } from './CollageSubject.tsx';
export { CollageScene } from './CollageScene.tsx';
export { EditorialType } from './EditorialType.tsx';
export { NotebookList } from './NotebookList.tsx';
export { ObjectReveal } from './ObjectReveal.tsx';

/** Univers de chaque template (pour le placement §10). */
export const INSERT_UNIVERSE = {
  CollageSubject: 'paper',
  CollageScene: 'paper',
  EditorialType: 'paper',
  NotebookList: 'dark',
  ObjectReveal: 'paper',
} as const;

export type InsertTemplate = keyof typeof INSERT_UNIVERSE;
