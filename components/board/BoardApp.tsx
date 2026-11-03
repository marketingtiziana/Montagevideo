'use client';

import dynamic from 'next/dynamic';

const BoardCanvas = dynamic(() => import('@/components/board/BoardCanvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full" style={{ background: '#FBFBF8' }} />,
});

export default function BoardApp() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden">
      <BoardCanvas />
    </main>
  );
}
