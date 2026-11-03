'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { board } from '@/data/board';
import { buildEdges, buildNodes, LINES_NODE_ID, type BoardNode } from './graph';
import ElementNode from './ElementNode';
import LinesNode from './LinesNode';
import RoughEdge from '@/components/mindmap/RoughEdge';
import BoardToolbar from './BoardToolbar';
import { exportCanvasPng } from '@/lib/export-png';

const nodeTypes: NodeTypes = { element: ElementNode, lines: LinesNode };
const edgeTypes: EdgeTypes = { rough: RoughEdge };

const initialNodes = buildNodes(board.elements);
const initialEdges = buildEdges();

function Canvas() {
  const [nodes, , onNodesChange] = useNodesState<BoardNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [hidden, setHidden] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { fitView, getNodes } = useReactFlow();

  const elementNodes = useCallback(() => getNodes().filter((n) => n.id !== LINES_NODE_ID), [getNodes]);

  const fitAll = useCallback(() => {
    void fitView({ nodes: elementNodes(), padding: 0.08, duration: 500 });
  }, [fitView, elementNodes]);

  const toggleHidden = useCallback(() => setHidden((h) => !h), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey) setHidden((h) => !h);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const exportPng = useCallback(async () => {
    const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (!viewport) return;
    setExporting(true);
    try {
      await exportCanvasPng({
        viewport,
        bounds: getNodesBounds(elementNodes()),
        padding: 140,
        scale: 2,
        background: board.background.paper,
        grid: { kind: 'lines', gap: board.background.gridGap, color: board.background.grid },
        fileName: 'board-llc.png',
      });
    } finally {
      setExporting(false);
    }
  }, [elementNodes]);

  const fitOptions = useMemo(() => ({ padding: 0.08, nodes: initialNodes.filter((n) => n.id !== LINES_NODE_ID) }), []);

  return (
    <div className="relative h-full w-full" style={{ background: board.background.paper }}>
      <ReactFlow<BoardNode>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={fitOptions}
        minZoom={0.1}
        maxZoom={3}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: board.background.paper }}
      >
        <Background variant={BackgroundVariant.Lines} gap={board.background.gridGap} lineWidth={1} color={board.background.grid} />
        {!hidden && <Controls showInteractive={false} position="bottom-left" />}
      </ReactFlow>
      <BoardToolbar hidden={hidden} exporting={exporting} onFit={fitAll} onToggleHidden={toggleHidden} onExport={exportPng} />
    </div>
  );
}

export default function BoardCanvas() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
