'use client';

import { Handle, Position } from '@xyflow/react';
import type { CSSProperties, ReactNode } from 'react';

interface NodeShellProps {
  rotation: number;
  selected?: boolean;
  accent: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  label: string;
}

const handleStyle: CSSProperties = {
  opacity: 0,
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  border: 0,
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
};

/**
 * Enveloppe commune : rotation légère (le « désordre »), poignées invisibles au centre
 * pour que les liens partent du centre du nœud, et anneau de sélection.
 */
export default function NodeShell({ rotation, selected, accent, className, style, children, label }: NodeShellProps) {
  return (
    <div
      className="mindmap-rotor relative"
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%', ...style }}
      role="button"
      aria-label={label}
    >
      <div
        className={`relative rounded-2xl transition-shadow duration-200 ${
          selected ? 'shadow-lift' : 'shadow-soft hover:shadow-lift'
        } ${className ?? ''}`}
        style={selected ? { boxShadow: `0 0 0 3px #ffffff, 0 0 0 6px ${accent}, 0 18px 40px -12px rgba(15,21,53,0.28)` } : undefined}
      >
        {children}
      </div>
      <Handle type="source" position={Position.Top} style={handleStyle} isConnectable={false} />
      <Handle type="target" position={Position.Top} style={handleStyle} isConnectable={false} />
    </div>
  );
}
