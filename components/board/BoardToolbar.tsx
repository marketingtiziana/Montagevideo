'use client';

import { Download, EyeOff, Eye, Maximize2, Loader2 } from 'lucide-react';

interface BoardToolbarProps {
  hidden: boolean;
  exporting: boolean;
  onFit: () => void;
  onToggleHidden: () => void;
  onExport: () => void;
}

export default function BoardToolbar({ hidden, exporting, onFit, onToggleHidden, onExport }: BoardToolbarProps) {
  if (hidden) {
    return (
      <button
        type="button"
        onClick={onToggleHidden}
        className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-[#0F1535] opacity-30 transition hover:opacity-100"
        aria-label="Afficher l’interface"
        title="Afficher l’interface (touche H)"
      >
        <Eye size={14} aria-hidden />
      </button>
    );
  }
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2">
      <button
        type="button"
        onClick={onFit}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#0F1535] shadow-soft transition hover:bg-[#F3F4F6]"
      >
        <Maximize2 size={16} aria-hidden />
        Tout voir
      </button>
      <button
        type="button"
        onClick={onToggleHidden}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#0F1535] shadow-soft transition hover:bg-[#F3F4F6]"
        title="Touche H"
      >
        <EyeOff size={16} aria-hidden />
        Masquer l’interface
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-[#0F1535] px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition hover:bg-[#2B41BF] disabled:opacity-60"
      >
        {exporting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
        Export PNG
      </button>
    </div>
  );
}
