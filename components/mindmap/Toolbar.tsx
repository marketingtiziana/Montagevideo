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
  /** Panneau latéral ouvert : on libère la place à droite pour garder les boutons accessibles. */
  panelOpen?: boolean;
}

export default function Toolbar({ mode, onToggleMode, onExport, exporting, panelOpen }: ToolbarProps) {
  const tidy = mode === 'tidy';
  const toggleLabel = tidy ? 'Désordre' : 'Ranger';
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 transition-[padding] duration-300 sm:p-4 ${
        panelOpen ? 'sm:pr-[420px]' : ''
      }`}
    >
      <div className="pointer-events-auto min-w-0 rounded-2xl bg-white/90 px-3.5 py-2.5 shadow-soft backdrop-blur sm:px-4 sm:py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-700 sm:text-[10px]">Fynovates</p>
        <h1 className="truncate text-[15px] font-black leading-tight tracking-tight text-navy sm:text-xl">
          Comment fonctionne une LLC
        </h1>
        <p className="hidden text-[12px] text-slate-600 sm:block">Cliquez sur un élément pour lire l’explication complète.</p>
        <p className="text-[10.5px] leading-snug text-slate-600 sm:hidden">Touchez un élément pour lire. Pincez pour zoomer.</p>
      </div>
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleMode}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-[13px] font-semibold text-navy shadow-soft transition hover:bg-indigo-50 sm:h-auto sm:px-3.5 sm:py-2.5"
          aria-pressed={tidy}
          aria-label={toggleLabel}
          title={tidy ? 'Revenir au layout éparpillé' : 'Ranger les éléments en layout radial'}
        >
          {tidy ? <Shuffle size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
          <span className="hidden sm:inline">{toggleLabel}</span>
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-3 text-[13px] font-semibold text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-60 sm:h-auto sm:px-3.5 sm:py-2.5"
          aria-label="Exporter PNG"
          title="Exporter le board en PNG (2x)"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
          <span className="hidden sm:inline">Exporter PNG</span>
        </button>
      </div>
    </div>
  );
}

/** Légende des clusters, affichée en bas du board (masquée sur mobile). */
export function Legend({ clusters }: { clusters: Cluster[] }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 hidden justify-center sm:flex">
      <div className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/90 px-3.5 py-1.5 shadow-soft backdrop-blur">
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
