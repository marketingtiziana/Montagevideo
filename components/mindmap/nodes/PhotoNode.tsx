'use client';

import { memo } from 'react';
import Image from 'next/image';
import type { NodeProps } from '@xyflow/react';
import type { FlowNode } from '@/components/mindmap/graph';
import type { PhotoNodeData } from '@/data/types';
import { ICONS } from '@/lib/icons';
import { getImageCredit } from '@/lib/credits';
import NodeShell from './NodeShell';
import ClusterTag from './ClusterTag';

const WIDTHS = { sm: 220, md: 256, lg: 296 } as const;

function PhotoNode({ data, selected }: NodeProps<FlowNode>) {
  const node = data.node as PhotoNodeData;
  const credit = getImageCredit(node.id);
  const Icon = ICONS[node.icon];
  const width = WIDTHS[node.size ?? 'md'];
  // Rotation propre à la photo, légèrement différente du cadre : effet « posée sur la table ».
  const innerTilt = data.rotation * -0.35;

  return (
    <NodeShell rotation={data.rotation} selected={selected} accent={data.cluster.color}>
      <div className="rounded-2xl bg-white p-2.5" style={{ width }}>
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ aspectRatio: '4 / 3', transform: `rotate(${innerTilt}deg)`, background: data.cluster.soft }}
        >
          {credit ? (
            <Image
              src={`/mindmap/${node.id}.jpg`}
              alt={credit.alt || node.caption}
              fill
              sizes="(max-width: 768px) 60vw, 300px"
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${data.cluster.soft} 0%, #ffffff 60%, ${data.cluster.soft} 100%)`,
                color: data.cluster.ink,
              }}
              aria-label={node.caption}
              role="img"
            >
              <Icon size={34} strokeWidth={1.8} aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wide">{data.cluster.label}</span>
            </div>
          )}
        </div>
        <div className="px-1 pb-1 pt-2.5">
          <ClusterTag label={data.cluster.label} color={data.cluster.color} ink={data.cluster.ink} soft={data.cluster.soft} />
          <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-navy">{node.caption}</p>
          {credit && (
            <p className="mt-1 text-[10px] text-slate-600">
              Photo : {credit.photographer} (Pexels)
            </p>
          )}
        </div>
      </div>
    </NodeShell>
  );
}

export default memo(PhotoNode);
