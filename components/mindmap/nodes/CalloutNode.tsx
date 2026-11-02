'use client';

import { useEffect, useRef, useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNode } from '@/components/mindmap/graph';
import type { CalloutNodeData } from '@/data/types';
import { ICONS } from '@/lib/icons';
import { roughRectPaths } from '@/lib/rough';
import { hashSeed } from '@/lib/random';
import NodeShell from './NodeShell';

const VARIANTS = {
  warning: { label: 'Piège', icon: 'alert-triangle', bg: '#ECE8FF', color: '#6E5BE8' },
  remember: { label: 'À retenir', icon: 'lightbulb', bg: '#E8ECFF', color: '#4F6BFF' },
} as const;

export default function CalloutNode({ data, selected }: NodeProps<FlowNode>) {
  const node = data.node as CalloutNodeData;
  const variant = VARIANTS[node.variant];
  const Icon = ICONS[variant.icon];
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const size = node.size ?? 'md';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paths = box.w > 0 ? roughRectPaths(box.w, box.h, { seed: hashSeed(node.id), stroke: variant.color, radius: 16 }) : [];

  return (
    <NodeShell rotation={data.rotation} selected={selected} accent={variant.color} label={node.title}>
      <div
        ref={ref}
        className="relative rounded-2xl px-4 py-3.5"
        style={{ background: variant.bg, minWidth: size === 'sm' ? 220 : size === 'lg' ? 284 : 248 }}
      >
        {box.w > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${box.w} ${box.h}`}
            aria-hidden
          >
            {paths.map((p, i) => (
              <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" />
            ))}
          </svg>
        )}
        <div className="relative flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white"
            style={{ color: variant.color }}
          >
            <Icon size={16} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: variant.color }}>
            {variant.label}
          </span>
        </div>
        <h3 className="relative mt-2 text-[15px] font-black leading-tight tracking-tight text-navy">{node.title}</h3>
        <p className="relative mt-1.5 text-[12.5px] leading-snug text-slate-700">{node.body}</p>
      </div>
    </NodeShell>
  );
}
