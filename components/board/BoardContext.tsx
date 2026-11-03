'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Board } from '@/data/board';

const BoardContext = createContext<Board | null>(null);

export function BoardProvider({ board, children }: { board: Board; children: ReactNode }) {
  return <BoardContext.Provider value={board}>{children}</BoardContext.Provider>;
}

/** Board courant (données), fourni par BoardCanvas. */
export function useBoard(): Board {
  const board = useContext(BoardContext);
  if (!board) throw new Error('useBoard doit être utilisé sous BoardProvider');
  return board;
}
