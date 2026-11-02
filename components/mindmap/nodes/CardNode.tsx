'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNode } from '@/components/mindmap/graph';
import type { CardNodeData } from '@/data/types';
import { ICONS } from '@/lib/icons';
import NodeShell from './NodeShell';
import ClusterTag from './ClusterTag';

const REQUIRED_LABEL: Record<CardNodeData['required'], { label: string; bg: string; color: string }> = {
  required: { label: 'Obligatoire', bg: '#0F1535', color: '#ffffff' },
  optional: { label: 'Optionnel', bg: '#E7EAF0', color: '#3E4B68' },
  external: { label: 'Administration', bg: '#E3F1FD', color: '#1F6FA8' },
};

function CardNode({ data, selected }: NodeProps<FlowNode>) {
  const node = data.node as CardNodeData;
  const Icon = ICONS[node.icon];
  const req = REQUIRED_LABEL[node.required];
  const size = node.size ?? 'md';

  return (
    <NodeShell rotation={data.rotation} selected={selected} accent={data.cluster.color}>
      <div
        className="rounded-2xl border border-white bg-white px-4 py-4"
        style={{ minWidth: size === 'sm' ? 232 : size === 'lg' ? 272 : 252 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: data.cluster.soft, color: data.cluster.color }}
          >
            <Icon size={22} strokeWidth={2.2} aria-hidden />
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: req.bg, color: req.color }}
          >
            {req.label}
          </span>
        </div>
        <p className="mt-3 text-[17px] font-black leading-tight tracking-tight text-navy">{node.role}</p>
        <dl className="mt-2 space-y-1.5 text-[12.5px] leading-snug">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide" style={{ color: data.cluster.ink }}>
              Qui
            </dt>
            <dd className="text-slate-700">{node.who}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide" style={{ color: data.cluster.ink }}>
              Rôle
            </dt>
            <dd className="text-slate-700">{node.does}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <ClusterTag label={data.cluster.label} color={data.cluster.color} ink={data.cluster.ink} soft={data.cluster.soft} />
        </div>
      </div>
    </NodeShell>
  );
}

export default memo(CardNode);
