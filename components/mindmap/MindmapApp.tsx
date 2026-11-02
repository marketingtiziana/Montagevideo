'use client';

import dynamic from 'next/dynamic';

const MindmapBoard = dynamic(() => import('@/components/mindmap/MindmapBoard'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-board">
      <div className="rounded-2xl bg-white px-5 py-4 shadow-soft">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">Fynovates</p>
        <p className="text-base font-black text-navy">Chargement de la mindmap…</p>
      </div>
    </div>
  ),
});

export default function MindmapApp() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-board">
      <MindmapBoard />
    </main>
  );
}
