'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNode } from '@/components/mindmap/graph';
import type { SchemaNodeData } from '@/data/types';
import { SCHEMAS } from '@/components/mindmap/schemas';
import NodeShell from './NodeShell';
import ClusterTag from './ClusterTag';

const WIDTHS = { sm: 280, md: 320, lg: 360 } as const;

function SchemaNode({ data, selected }: NodeProps<FlowNode>) {
  const node = data.node as SchemaNodeData;
  const Schema = SCHEMAS[node.schema];
  const width = WIDTHS[node.size ?? 'md'];

  return (
    <NodeShell rotation={data.rotation} selected={selected} accent={data.cluster.color}>
      <div className="rounded-2xl bg-white p-3" style={{ width }}>
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-[15px] font-black leading-tight tracking-tight text-navy">{node.title}</p>
          <ClusterTag label={data.cluster.label} color={data.cluster.color} ink={data.cluster.ink} soft={data.cluster.soft} />
        </div>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-100" style={{ background: '#F9FAFD' }}>
          <Schema accent={data.cluster.color} soft={data.cluster.soft} ink={data.cluster.ink} seed={node.id} />
        </div>
        {node.caption && <p className="px-1 pb-0.5 pt-2 text-[12px] leading-snug text-slate-600">{node.caption}</p>}
      </div>
    </NodeShell>
  );
}

export default memo(SchemaNode);
