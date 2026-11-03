'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { ElementNode as ElementNodeType } from './graph';
import MetricCard from './elements/MetricCard';
import ChatCard from './elements/ChatCard';
import PostitCard from './elements/PostitCard';
import DocCard from './elements/DocCard';
import PhotoCard from './elements/PhotoCard';
import TableCard from './elements/TableCard';
import BankCard from './elements/BankCard';
import MemeCard from './elements/MemeCard';
import FlowCard from './elements/FlowCard';
import ChartCard from './elements/ChartCard';

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

function ElementNode({ data, selected }: NodeProps<ElementNodeType>) {
  const { el } = data;
  let content;
  switch (el.type) {
    case 'metric':
      content = <MetricCard el={el} />;
      break;
    case 'chat':
      content = <ChatCard el={el} />;
      break;
    case 'postit':
      content = <PostitCard el={el} />;
      break;
    case 'doc':
      content = <DocCard el={el} />;
      break;
    case 'photo':
      content = <PhotoCard el={el} />;
      break;
    case 'table':
      content = <TableCard el={el} />;
      break;
    case 'bank':
      content = <BankCard el={el} />;
      break;
    case 'meme':
      content = <MemeCard el={el} />;
      break;
    case 'flow':
      content = <FlowCard el={el} />;
      break;
    case 'chart':
      content = <ChartCard el={el} />;
      break;
  }
  return (
    <div className={`relative transition-transform ${selected ? 'scale-[1.01]' : ''}`}>
      {content}
      <Handle type="source" position={Position.Top} style={handleStyle} isConnectable={false} />
      <Handle type="target" position={Position.Top} style={handleStyle} isConnectable={false} />
    </div>
  );
}

export default memo(ElementNode);
