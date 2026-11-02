'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { mindmap } from '@/data/mindmap';
import { applyLayout, buildFlowEdges, buildFlowNodes, clusterById, type FlowEdge, type FlowNode } from '@/components/mindmap/graph';
import { scatterLayout, tidyLayout, type LayoutMode, type MeasuredSizes } from '@/lib/layout';
import RoughEdge from '@/components/mindmap/RoughEdge';
import StickyNode from '@/components/mindmap/nodes/StickyNode';
import PhotoNode from '@/components/mindmap/nodes/PhotoNode';
import SchemaNode from '@/components/mindmap/nodes/SchemaNode';
import CardNode from '@/components/mindmap/nodes/CardNode';
import CalloutNode from '@/components/mindmap/nodes/CalloutNode';
import Toolbar, { Legend } from '@/components/mindmap/Toolbar';
import SidePanel from '@/components/mindmap/SidePanel';

const nodeTypes: NodeTypes = {
  sticky: StickyNode,
  photo: PhotoNode,
  schema: SchemaNode,
  card: CardNode,
  callout: CalloutNode,
};

const edgeTypes: EdgeTypes = {
  rough: RoughEdge,
};

const BOARD_BG = '#F5F7FB';
const GRID_COLOR = '#C9D0E0';
const GRID_GAP = 26;
const EXPORT_PADDING = 120;
const FIT_PADDING = 0.05;
const MIN_ZOOM = 0.12;
const MAX_ZOOM = 2.5;
/** Hauteur (px) réservée à l'en-tête, pour que le cadrage automatique ne masque aucun nœud. */
const HEADER_DESKTOP = 104;
const HEADER_MOBILE = 72;
/** Hauteur (px) réservée à la légende en bas (desktop uniquement). */
const FOOTER_DESKTOP = 48;
const initialNodes = buildFlowNodes(mindmap, scatterLayout(mindmap));
const initialEdges = buildFlowEdges(mindmap);

function Board() {
  const [measured, setMeasured] = useState<MeasuredSizes | null>(null);
  const layouts = useMemo(
    () => ({ scatter: scatterLayout(mindmap, measured ?? undefined), tidy: tidyLayout(mindmap, measured ?? undefined) }),
    [measured],
  );
  const clusters = useMemo(() => clusterById(mindmap), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<FlowEdge>(initialEdges);
  const [mode, setMode] = useState<LayoutMode>('scatter');
  const [animating, setAnimating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { getNodes, setViewport } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesInitialized = useNodesInitialized();
  const [ready, setReady] = useState(false);

  // Une fois les nœuds mesurés par React Flow, on recalcule le layout avec leurs vraies dimensions
  // (anti-collision précis), puis on affiche le board.
  useEffect(() => {
    if (!nodesInitialized || measured) return;
    const sizes: MeasuredSizes = {};
    for (const n of getNodes()) {
      if (n.measured?.width && n.measured?.height) sizes[n.id] = [n.measured.width, n.measured.height];
    }
    setMeasured(sizes);
  }, [nodesInitialized, measured, getNodes]);

  useEffect(() => {
    if (!measured) return;
    setNodes((current) => applyLayout(current, layouts.scatter));
    const raf = requestAnimationFrame(() => {
      void fitBoard(0);
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
    // Exécuté une seule fois, lorsque les dimensions mesurées deviennent disponibles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured]);

  /** Cadre le board dans la zone située sous l'en-tête (barre d'outils), pour ne rien masquer. */
  const fitBoard = useCallback(
    async (duration: number) => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const desktop = width >= 640;
      const header = desktop ? HEADER_DESKTOP : HEADER_MOBILE;
      const footer = desktop ? FOOTER_DESKTOP : 0;
      const bounds = getNodesBounds(getNodes());
      const vp = getViewportForBounds(bounds, width, height - header - footer, MIN_ZOOM, MAX_ZOOM, FIT_PADDING);
      await setViewport({ x: vp.x, y: vp.y + header, zoom: vp.zoom }, { duration });
    },
    [getNodes, setViewport],
  );

  const toggleMode = useCallback(() => {
    const next: LayoutMode = mode === 'scatter' ? 'tidy' : 'scatter';
    setMode(next);
    setAnimating(true);
    setNodes((current) => applyLayout(current, layouts[next]));
    if (animTimer.current) clearTimeout(animTimer.current);
    window.setTimeout(() => void fitBoard(700), 30);
    animTimer.current = setTimeout(() => setAnimating(false), 800);
  }, [mode, layouts, setNodes, fitBoard]);

  const onNodeClick = useCallback<NodeMouseHandler<FlowNode>>((_, node) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);
  const closePanel = useCallback(() => setSelectedId(null), []);

  const exportPng = useCallback(async () => {
    const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (!viewport) return;
    setExporting(true);
    try {
      const bounds = getNodesBounds(getNodes());
      const width = Math.ceil(bounds.width + EXPORT_PADDING * 2);
      const height = Math.ceil(bounds.height + EXPORT_PADDING * 2);
      const tx = -bounds.x + EXPORT_PADDING;
      const ty = -bounds.y + EXPORT_PADDING;
      const scale = 2;
      const snapshot = await toPng(viewport, {
        width,
        height,
        pixelRatio: scale,
        cacheBust: true,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${tx}px, ${ty}px) scale(1)`,
        },
      });
      // Composition finale : fond du board + grille pointillée + capture des nœuds et liens.
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = snapshot;
      });
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas indisponible');
      ctx.fillStyle = BOARD_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = GRID_COLOR;
      const gap = GRID_GAP * scale;
      for (let gx = gap / 2; gx < canvas.width; gx += gap) {
        for (let gy = gap / 2; gy < canvas.height; gy += gap) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `fynovates-mindmap-llc-${mode === 'tidy' ? 'range' : 'desordre'}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [getNodes, mode]);

  const selectedNode = selectedId ? mindmap.nodes.find((n) => n.id === selectedId) ?? null : null;
  const selectedCluster = selectedNode ? clusters[selectedNode.cluster] : null;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full transition-opacity duration-500 ${animating ? 'mindmap-animating' : ''} ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ReactFlow<FlowNode, FlowEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: FIT_PADDING }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        nodesConnectable={false}
        elementsSelectable
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: BOARD_BG }}
      >
        <Background variant={BackgroundVariant.Dots} gap={GRID_GAP} size={1.6} color={GRID_COLOR} />
        <MiniMap
          className="!hidden sm:!block"
          pannable
          zoomable
          nodeColor={(n) => clusters[(n as FlowNode).data.node.cluster]?.color ?? '#0F1535'}
          nodeStrokeWidth={0}
          maskColor="rgba(15, 21, 53, 0.08)"
          bgColor="#ffffff"
        />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
      <Toolbar
        mode={mode}
        onToggleMode={toggleMode}
        onExport={exportPng}
        exporting={exporting}
        clusters={mindmap.clusters}
        panelOpen={Boolean(selectedNode)}
      />
      <Legend clusters={mindmap.clusters} />
      <SidePanel node={selectedNode} cluster={selectedCluster} onClose={closePanel} />
    </div>
  );
}

export default function MindmapBoard() {
  return (
    <ReactFlowProvider>
      <Board />
    </ReactFlowProvider>
  );
}
