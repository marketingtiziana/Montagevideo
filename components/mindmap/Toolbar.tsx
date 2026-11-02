'use client';

import { Download, Shuffle, LayoutGrid, Loader2 } from 'lucide-react';
import type { Cluster } from '@/data/types';
import type { LayoutMode } from '@/lib/layout';

interface ToolbarProps {
  mode: LayoutMode;
  onToggleMode: () => void;
  onExport: () => void;
  exporting: boolean;
  clusters: Cluster[];
}

export default function Toolbar({ mode, onToggleMode, onExport, exporting, clusters }: ToolbarProps) {
  const tidy = mode === 'tidy';
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="pointer-events-auto rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">Fynovates</p>
          <h2 className="text-lg font-black leading-tight tracking-tight text-navy sm:text-xl">Comment fonctionne une LLC</h2>
          <p className="hidden text-[12px] text-slate-600 sm:block">Cliquez sur un élément pour lire l’explication complète.</p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold text-navy shadow-soft transition hover:bg-indigo-50"
            aria-pressed={tidy}
          >
            {tidy ? <Shuffle size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
            {tidy ? 'Désordre' : 'Ranger'}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
            <span className="hidden sm:inline">Exporter PNG</span>
            <span className="sm:hidden">PNG</span>
          </button>
        </div>
      </div>
      <div className="pointer-events-auto hidden w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/90 px-3 py-1.5 shadow-soft backdrop-blur sm:flex">
        {clusters.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
