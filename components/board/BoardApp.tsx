'use client';

import dynamic from 'next/dynamic';
import { BOARDS, type BoardId } from '@/lib/boards';

const BoardCanvas = dynamic(() => import('@/components/board/BoardCanvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full" style={{ background: '#FBFBF8' }} />,
});

export default function BoardApp({ boardId }: { boardId: BoardId }) {
  const board = BOARDS[boardId];
  return (
    <main className="h-[100dvh] w-full overflow-hidden" style={{ background: board.background.paper }}>
      <BoardCanvas board={board} />
    </main>
  );
}
