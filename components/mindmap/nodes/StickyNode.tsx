'use client';

import type { NodeProps } from '@xyflow/react';
import type { FlowNode } from '@/components/mindmap/graph';
import type { StickyNodeData, StickyTint } from '@/data/types';
import NodeShell from './NodeShell';
import ClusterTag from './ClusterTag';

const TINTS: Record<StickyTint, { bg: string; border: string; text: string }> = {
  indigo: { bg: '#E8ECFF', border: '#C2CCFF', text: '#2B41BF' },
  sky: { bg: '#E3F1FD', border: '#BFDFF7', text: '#1F6FA8' },
  slate: { bg: '#E7EAF0', border: '#CBD2DE', text: '#3E4B68' },
  mint: { bg: '#E1F5EF', border: '#B7E6D8', text: '#157A67' },
};

export default function StickyNode({ data, selected }: NodeProps<FlowNode>) {
  const node = data.node as StickyNodeData;
  const tint = TINTS[node.tint];
  const size = node.size ?? 'md';

  if (data.isRoot) {
    return (
      <NodeShell rotation={data.rotation} selected={selected} accent={data.cluster.color} label={node.title}>
        <div className="rounded-2xl bg-navy px-6 py-5 text-white" style={{ minWidth: 248 }}>
          <ClusterTag label={data.cluster.label} color="#ffffff" light />
          <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">{node.title}</h1>
          <p className="mt-2 text-[13px] leading-snug text-white/80">{node.body}</p>
        </div>
      </NodeShell>
    );
  }

  return (
    <NodeShell rotation={data.rotation} selected={selected} accent={data.cluster.color} label={node.title}>
      <div
        className={`rounded-2xl border px-4 ${size === 'lg' ? 'py-4' : 'py-3.5'}`}
        style={{ background: tint.bg, borderColor: tint.border, minWidth: size === 'sm' ? 200 : size === 'lg' ? 256 : 228 }}
      >
        <ClusterTag label={data.cluster.label} color={data.cluster.color} soft="rgba(255,255,255,0.7)" />
        <h3 className={`mt-2 font-black leading-tight tracking-tight text-navy ${size === 'lg' ? 'text-lg' : 'text-[15px]'}`}>
          {node.title}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: tint.text }}>
          {node.body}
        </p>
      </div>
    </NodeShell>
  );
}
