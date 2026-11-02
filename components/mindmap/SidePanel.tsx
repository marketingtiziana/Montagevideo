'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';
import type { Cluster, MindmapNode } from '@/data/types';

interface SidePanelProps {
  node: MindmapNode | null;
  cluster: Cluster | null;
  onClose: () => void;
}

const KIND_LABEL: Record<MindmapNode['kind'], string> = {
  sticky: 'Note',
  photo: 'Photo',
  schema: 'Schéma',
  card: 'Rôle',
  callout: 'À retenir',
};

export default function SidePanel({ node, cluster, onClose }: SidePanelProps) {
  const open = Boolean(node);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      className={`absolute z-30 flex flex-col bg-white shadow-lift transition-transform duration-300 ease-out
        inset-x-0 bottom-0 max-h-[78vh] rounded-t-3xl
        sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[400px] sm:rounded-none sm:rounded-l-3xl
        ${open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}`}
      aria-hidden={!open}
      aria-label="Explication détaillée"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pb-3 pt-4 sm:pt-5">
        <div>
          {cluster && node && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: cluster.soft, color: cluster.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cluster.color }} />
              {cluster.label} · {KIND_LABEL[node.kind]}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-navy transition hover:bg-indigo-50"
          aria-label="Fermer le panneau"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="mindmap-prose overflow-y-auto px-5 pb-8 pt-2 text-[14px]">
        {node && <ReactMarkdown>{node.details}</ReactMarkdown>}
      </div>
    </aside>
  );
}
