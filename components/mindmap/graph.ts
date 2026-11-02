import type { Edge, Node } from '@xyflow/react';
import type { Cluster, ClusterId, Mindmap, MindmapNode } from '@/data/types';
import type { Layout } from '@/lib/layout';
import { hashSeed } from '@/lib/random';

export interface FlowNodeData extends Record<string, unknown> {
  node: MindmapNode;
  cluster: Cluster;
  rotation: number;
  isRoot: boolean;
}

export type FlowNode = Node<FlowNodeData, MindmapNode['kind']>;

export interface FlowEdgeData extends Record<string, unknown> {
  label?: string;
  color: string;
  seed: number;
}

export type FlowEdge = Edge<FlowEdgeData>;

export function clusterById(map: Mindmap): Record<ClusterId, Cluster> {
  return Object.fromEntries(map.clusters.map((c) => [c.id, c])) as Record<ClusterId, Cluster>;
}

export function buildFlowNodes(map: Mindmap, layout: Layout): FlowNode[] {
  const clusters = clusterById(map);
  return map.nodes.map((node) => {
    const place = layout[node.id];
    const isRoot = node.id === map.rootId;
    return {
      id: node.id,
      type: node.kind,
      position: { x: place?.x ?? 0, y: place?.y ?? 0 },
      data: { node, cluster: clusters[node.cluster], rotation: place?.rotation ?? 0, isRoot },
      draggable: true,
      selectable: true,
      zIndex: isRoot ? 10 : node.kind === 'schema' ? 1 : 2,
      style: { width: place?.width },
    };
  });
}

export function buildFlowEdges(map: Mindmap): FlowEdge[] {
  const clusters = clusterById(map);
  return map.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'rough',
    data: { label: edge.label, color: clusters[edge.cluster].color, seed: hashSeed(edge.id) },
  }));
}

/** Applique un nouveau layout aux nœuds existants (positions + rotations) sans recréer les objets de données. */
export function applyLayout(nodes: FlowNode[], layout: Layout): FlowNode[] {
  return nodes.map((n) => {
    const place = layout[n.id];
    if (!place) return n;
    return { ...n, position: { x: place.x, y: place.y }, data: { ...n.data, rotation: place.rotation } };
  });
}
