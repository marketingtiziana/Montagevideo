import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import clsx from 'clsx'
import { ChevronsDownUp, ExternalLink, Focus, Maximize, Minus, Plus, RotateCcw, Search, Spline, X } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Thumb } from '../components/images/Thumb'
import { Button, IconButton, Loading, ValidationBadge } from '../components/ui'
import { BRANDS, VALIDATION_TONE } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useBrands, useById, useChannels, useContents, useImages, useJourneys, useMatrix, useProblems, useRules } from '../lib/hooks'
import { buildTree, journeyFor, territoryForPlatform, type TreeNode } from '../lib/mapTree'
import type { ImageAsset } from '../lib/types'

/* ------------------------------------------------------------------ layout */

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: state stays in memory */
  }
}

const W: Record<TreeNode['kind'], number> = { territory: 300, branch: 260, leaf: 270, entity: 290, image: 210 }
const GAP_X = 64
const GAP_Y = 10
const COL_W = 1460
const COLS = 3
const ROW_GAP = 140

function nodeHeight(n: TreeNode) {
  if (n.kind === 'territory') return 96
  if (n.kind === 'branch') return 42
  if (n.kind === 'entity') return n.imageId ? 70 : 62
  if (n.kind === 'image') return 168
  const lines = Math.min(4, Math.ceil(n.label.length / 40))
  return 18 + lines * 17 + (n.meta || n.validation ? 18 : 0)
}

interface Placed {
  n: TreeNode
  x: number
  y: number
  depth: number
  parent: string | null
  territory: string
}

function layoutTree(root: TreeNode, open: Set<string>, ox: number, oy: number): { placed: Placed[]; height: number } {
  const placed: Placed[] = []
  const isOpen = (n: TreeNode) => n.children.length > 0 && open.has(n.id)
  const measure = new Map<string, number>()
  const sub = (n: TreeNode): number => {
    const h = nodeHeight(n)
    if (!isOpen(n)) {
      measure.set(n.id, h)
      return h
    }
    const ch = n.children.reduce((a, c) => a + sub(c), 0) + GAP_Y * (n.children.length - 1)
    const t = Math.max(h, ch)
    measure.set(n.id, t)
    return t
  }
  const total = sub(root)
  const place = (n: TreeNode, x: number, top: number, depth: number, parent: string | null) => {
    const st = measure.get(n.id)!
    const h = nodeHeight(n)
    placed.push({ n, x, y: top + (st - h) / 2, depth, parent, territory: root.id })
    if (!isOpen(n)) return
    const ch = n.children.reduce((a, c) => a + measure.get(c.id)!, 0) + GAP_Y * (n.children.length - 1)
    let y = top + (st - ch) / 2
    for (const c of n.children) {
      place(c, x + W[n.kind] + GAP_X, y, depth + 1, n.id)
      y += measure.get(c.id)! + GAP_Y
    }
  }
  place(root, ox, oy, 0, null)
  return { placed, height: total }
}

function flatten(roots: TreeNode[]) {
  const all = new Map<string, { n: TreeNode; ancestors: string[] }>()
  const walk = (n: TreeNode, anc: string[]) => {
    all.set(n.id, { n, ancestors: anc })
    n.children.forEach((c) => walk(c, [...anc, n.id]))
  }
  roots.forEach((r) => walk(r, []))
  return all
}

/* ------------------------------------------------------------------ nodes */

type NodeData = {
  n: TreeNode
  open: boolean
  dim: boolean
  focused: boolean
  img?: ImageAsset
  onToggle: (id: string) => void
}

const Toggle = ({ d }: { d: NodeData }) =>
  d.n.children.length > 0 ? (
    <button
      type="button"
      className="nodrag absolute -right-3 top-1/2 z-10 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-surface px-1 text-[10px] font-semibold text-ink-2 shadow-[var(--shadow)] hover:text-ink"
      aria-label={d.open ? 'Replier' : 'Déplier'}
      onClick={(e) => {
        e.stopPropagation()
        d.onToggle(d.n.id)
      }}
    >
      {d.open ? <Minus size={11} /> : <span className="flex items-center gap-0.5"><Plus size={10} />{d.n.children.length}</span>}
    </button>
  ) : null

const handles = (
  <>
    <Handle type="target" position={Position.Left} isConnectable={false} />
    <Handle type="source" position={Position.Right} isConnectable={false} />
  </>
)

const TerritoryNode = memo(({ data }: NodeProps<Node<NodeData>>) => (
  <div
    className={clsx(
      'relative w-[300px] rounded-xl border bg-surface px-4 py-3 shadow-[var(--shadow)] transition-opacity',
      data.focused ? 'border-ink ring-2 ring-ink/10' : 'border-line-strong',
      data.dim && 'opacity-30',
    )}
    style={{ height: 96 }}
  >
    {handles}
    <div className="flex items-baseline gap-3">
      <span className="display text-[34px] leading-none text-ink-3">{data.n.num}</span>
      <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">{data.n.label}</span>
    </div>
    <div className="mt-2 text-[11px] text-ink-3">{data.n.children.length} branches</div>
    <Toggle d={data} />
  </div>
))

const BranchNode = memo(({ data }: NodeProps<Node<NodeData>>) => (
  <div
    className={clsx(
      'relative flex h-[42px] w-[260px] items-center gap-2 rounded-lg border bg-surface-2 px-3 transition-opacity',
      data.focused ? 'border-ink' : 'border-line',
      data.dim && 'opacity-30',
    )}
  >
    {handles}
    {data.n.color && <span className="h-4 w-[3px] shrink-0 rounded-full" style={{ background: data.n.color }} />}
    <span className="truncate text-[12.5px] font-medium">{data.n.label}</span>
    {data.n.meta && data.n.children.length === 0 && <span className="ml-auto pr-3 text-[11px] tabular text-ink-3">{data.n.meta}</span>}
    <Toggle d={data} />
  </div>
))

const LeafNode = memo(({ data }: NodeProps<Node<NodeData>>) => (
  <div
    className={clsx(
      'relative w-[270px] rounded-lg border bg-surface px-3 py-2 transition-opacity',
      data.focused ? 'border-ink' : 'border-line',
      data.dim && 'opacity-30',
    )}
  >
    {handles}
    <div className="flex gap-2">
      {data.n.color && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: data.n.color }} />}
      <span className="line-clamp-4 text-[12px] leading-[17px] text-ink-2">{data.n.label}</span>
    </div>
    {(data.n.meta || data.n.validation) && (
      <div className="mt-1 flex items-center gap-2 text-[10.5px] text-ink-3">
        {data.n.meta && <span className="truncate">{data.n.meta}</span>}
        {data.n.validation && <ValidationDot v={data.n.validation} />}
      </div>
    )}
  </div>
))

const ValidationDot = ({ v }: { v: TreeNode['validation'] }) =>
  v ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap" style={{ color: `var(--v-${VALIDATION_TONE[v]})` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {v}
    </span>
  ) : null

const EntityNode = memo(({ data }: NodeProps<Node<NodeData>>) => (
  <div
    className={clsx(
      'relative flex w-[290px] items-center gap-2.5 rounded-lg border bg-surface p-2 pr-4 shadow-[var(--shadow)] transition-opacity',
      data.focused ? 'border-ink ring-2 ring-ink/10' : 'border-line',
      data.dim && 'opacity-30',
    )}
    style={{ height: data.n.imageId ? 70 : 62 }}
  >
    {handles}
    <span className="h-full w-[3px] shrink-0 rounded-full" style={{ background: data.n.color }} />
    {data.img && <Thumb img={data.img} className="h-[52px] w-[44px] shrink-0 rounded object-top" />}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
        <span className="font-mono">{data.n.num}</span>
        {data.n.meta && <span className="truncate">· {data.n.meta}</span>}
      </div>
      <div className="line-clamp-2 text-[12px] font-medium leading-[16px] text-ink">{data.n.label}</div>
    </div>
    <Toggle d={data} />
  </div>
))

const ImageNode = memo(({ data }: NodeProps<Node<NodeData>>) => (
  <div
    className={clsx('relative w-[210px] overflow-hidden rounded-lg border bg-surface shadow-[var(--shadow)] transition-opacity', data.focused ? 'border-ink' : 'border-line', data.dim && 'opacity-30')}
    style={{ height: 168 }}
  >
    {handles}
    <Thumb img={data.img} className="h-[124px] w-full object-top" />
    <div className="px-2 py-1.5">
      <div className="font-mono text-[10.5px] text-ink-3">{data.n.num}</div>
      <div className="truncate text-[11px] text-ink-2">{data.n.label}</div>
    </div>
  </div>
))

const nodeTypes = { territory: TerritoryNode, branch: BranchNode, leaf: LeafNode, entity: EntityNode, image: ImageNode }

/* ------------------------------------------------------------------ view */

const DEFAULT_OPEN = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T04/A', 'T04/p:PB-A01']

export default function MindMapView() {
  return (
    <ReactFlowProvider>
      <MindMap />
    </ReactFlowProvider>
  )
}

function MindMap() {
  const contents = useContents()
  const problems = useProblems()
  const images = useImages()
  const channels = useChannels()
  const brands = useBrands()
  const journeys = useJourneys()
  const matrix = useMatrix()
  const rules = useRules()
  const [saved, setSaved] = useState<{ id: string; x: number; y: number }[]>(() => readLS('mapLayout', []))
  const persistLayout = useCallback((next: { id: string; x: number; y: number }[]) => {
    setSaved(next)
    writeLS('mapLayout', next)
  }, [])
  const imgById = useById(images)
  const rf = useReactFlow()
  const nav = useNavigate()
  const { open: openDetail } = useDetail()
  const wrap = useRef<HTMLDivElement>(null)
  const lastClick = useRef<{ id: string; t: number } | null>(null)

  const [openSet, setOpenSet] = useState<Set<string> | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [cross, setCross] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!openSet) setOpenSet(new Set(readLS<string[]>('mapOpen', DEFAULT_OPEN)))
  }, [openSet])

  const persistOpen = useCallback((s: Set<string>) => {
    setOpenSet(s)
    writeLS('mapOpen', [...s])
  }, [])

  const ready = !!openSet
  const tree = useMemo(
    () => (ready ? buildTree({ contents, problems, images, channels, brands, journeys, matrix, rules }) : []),
    [ready, contents, problems, images, channels, brands, journeys, matrix, rules],
  )
  const index = useMemo(() => flatten(tree), [tree])

  const toggle = useCallback(
    (id: string) => {
      if (!openSet) return
      const s = new Set(openSet)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      persistOpen(s)
    },
    [openSet, persistOpen],
  )

  /* compute layout */
  const placed = useMemo(() => {
    if (!openSet) return []
    const colY = Array(COLS).fill(0)
    const out: Placed[] = []
    tree.forEach((t, i) => {
      const col = i % COLS
      const { placed: p, height } = layoutTree(t, openSet, col * COL_W, colY[col])
      colY[col] += height + ROW_GAP
      out.push(...p)
    })
    const savedMap = new Map((saved ?? []).map((s) => [s.id, s]))
    return out.map((p) => {
      const off = savedMap.get(`off:${p.territory}`)
      const abs = savedMap.get(p.n.id)
      return abs ? { ...p, x: abs.x, y: abs.y } : off ? { ...p, x: p.x + off.x, y: p.y + off.y } : p
    })
  }, [tree, openSet, saved])

  /* edges */
  const { edges, neighbors } = useMemo(() => {
    const visible = new Set(placed.map((p) => p.n.id))
    const es: Edge[] = []
    const nb = new Map<string, Set<string>>()
    const link = (a: string, b: string) => {
      if (!nb.has(a)) nb.set(a, new Set())
      if (!nb.has(b)) nb.set(b, new Set())
      nb.get(a)!.add(b)
      nb.get(b)!.add(a)
    }
    for (const p of placed) {
      if (!p.parent) continue
      es.push({ id: `h:${p.n.id}`, source: p.parent, target: p.n.id, style: { stroke: 'var(--line-strong)', strokeWidth: 1.25 } })
      link(p.parent, p.n.id)
    }
    if (cross && contents) {
      const firstInstance = new Map<string, string>()
      for (const p of placed) if (p.n.ref?.t === 'c' && !firstInstance.has(p.n.ref.id)) firstInstance.set(p.n.ref.id, p.n.id)
      const byId = new Map(contents.map((c) => [c.id, c]))
      for (const [cid, nodeId] of firstInstance) {
        const c = byId.get(cid)
        if (!c) continue
        const color = BRANDS[c.brands[0]].color
        const style = { stroke: color, strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.7 }
        const terr = nodeId.split('/')[0]
        for (const pl of c.platforms) {
          const t = territoryForPlatform(pl)
          if (t !== terr && visible.has(t)) {
            es.push({ id: `x:${nodeId}>${t}`, source: nodeId, target: t, style, zIndex: 0 })
            link(nodeId, t)
          }
        }
        const j = journeyFor(c)
        if (j && visible.has(`T14/${j}`)) {
          es.push({ id: `x:${nodeId}>${j}`, source: nodeId, target: `T14/${j}`, style, label: 'CTA', labelStyle: { fontSize: 10, fill: 'var(--ink-3)' }, labelBgStyle: { fill: 'var(--bg)' } })
          link(nodeId, `T14/${j}`)
        }
        for (const r of c.relatedIds) {
          const other = firstInstance.get(r)
          if (other && cid < r) {
            es.push({ id: `x:${nodeId}~${other}`, source: nodeId, target: other, style: { ...style, stroke: 'var(--ink-3)' } })
            link(nodeId, other)
          }
        }
      }
    }
    return { edges: es, neighbors: nb }
  }, [placed, cross, contents])

  const focusSet = useMemo(() => {
    if (!focus) return null
    const s = new Set<string>([focus])
    neighbors.get(focus)?.forEach((x) => s.add(x))
    let cur = placed.find((p) => p.n.id === focus)?.parent
    while (cur) {
      s.add(cur)
      cur = placed.find((p) => p.n.id === cur)?.parent ?? null
    }
    return s
  }, [focus, neighbors, placed])

  const computedNodes: Node<NodeData>[] = useMemo(
    () =>
      placed.map((p) => ({
        id: p.n.id,
        type: p.n.kind,
        position: { x: p.x, y: p.y },
        data: {
          n: p.n,
          open: !!openSet?.has(p.n.id),
          dim: !!focusSet && !focusSet.has(p.n.id),
          focused: focus === p.n.id,
          img: p.n.imageId ? imgById.get(p.n.imageId) : undefined,
          onToggle: toggle,
        },
      })),
    [placed, openSet, focusSet, focus, imgById, toggle],
  )
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([])
  useEffect(() => setNodes(computedNodes), [computedNodes, setNodes])

  const styledEdges = useMemo(
    () =>
      edges.map((e) =>
        focusSet && !(focusSet.has(e.source) && focusSet.has(e.target)) ? { ...e, style: { ...e.style, opacity: 0.12 } } : e,
      ),
    [edges, focusSet],
  )

  /* drag: territory moves its whole tree (offset), other nodes are pinned */
  const dragStart = useRef<{ id: string; x: number; y: number } | null>(null)
  const onNodeDragStart = useCallback((_: unknown, n: Node) => {
    dragStart.current = { id: n.id, x: n.position.x, y: n.position.y }
  }, [])
  const onNodeDrag = useCallback(
    (_: unknown, n: Node<NodeData>) => {
      if (n.data.n.kind !== 'territory' || !dragStart.current) return
      const dx = n.position.x - dragStart.current.x
      const dy = n.position.y - dragStart.current.y
      setNodes((ns) =>
        ns.map((x) => {
          if (x.id === n.id) return x
          const p = placed.find((pp) => pp.n.id === x.id)
          if (!p || p.territory !== n.id) return x
          return { ...x, position: { x: p.x + dx, y: p.y + dy } }
        }),
      )
    },
    [placed, setNodes],
  )
  const onNodeDragStop = useCallback(
    async (_: unknown, n: Node<NodeData>) => {
      const st = dragStart.current
      dragStart.current = null
      if (!st) return
      const rest = saved.filter((x) => x.id !== (n.data.n.kind === 'territory' ? `off:${n.id}` : n.id))
      if (n.data.n.kind === 'territory') {
        const prev = saved.find((x) => x.id === `off:${n.id}`) ?? { x: 0, y: 0 }
        persistLayout([...rest, { id: `off:${n.id}`, x: prev.x + n.position.x - st.x, y: prev.y + n.position.y - st.y }])
      } else persistLayout([...rest, { id: n.id, x: n.position.x, y: n.position.y }])
    },
    [saved, persistLayout],
  )

  const fit = () => rf.fitView({ padding: 0.08, duration: 450 })
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else wrap.current?.requestFullscreen?.()
  }

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const seen = new Set<string>()
    return [...index.values()]
      .filter(({ n }) => `${n.num ?? ''} ${n.label}`.toLowerCase().includes(s))
      .filter(({ n }) => {
        const key = n.ref && n.ref.t !== 'route' ? `${n.ref.t}:${n.ref.id}` : n.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)
  }, [q, index])

  const reveal = (id: string) => {
    const e = index.get(id)
    if (!e || !openSet) return
    const s = new Set(openSet)
    e.ancestors.forEach((a) => s.add(a))
    persistOpen(s)
    setFocus(id)
    setQ('')
    setTimeout(() => {
      const node = rf.getNode(id)
      if (node) rf.setCenter(node.position.x + 140, node.position.y + 30, { zoom: 1, duration: 500 })
    }, 60)
  }

  const focused = focus ? index.get(focus)?.n : null

  if (!ready) return <Loading />

  return (
    <div ref={wrap} className="relative h-full w-full bg-bg">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, n) => {
          const now = Date.now()
          const last = lastClick.current
          lastClick.current = { id: n.id, t: now }
          if (last && last.id === n.id && now - last.t < 400) {
            lastClick.current = null
            const r = (n.data as NodeData).n.ref
            if (!r) return toggle(n.id)
            if (r.t === 'route') nav(r.to)
            else openDetail(r.t, r.id)
            return
          }
          setFocus(n.id)
        }}
        zoomOnDoubleClick={false}
        onPaneClick={() => setFocus(null)}
        nodesConnectable={false}
        minZoom={0.05}
        maxZoom={1.8}
        defaultViewport={{ x: 40, y: 80, zoom: 0.42 }}
        proOptions={{ hideAttribution: true }}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--line-strong)" />
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          nodeColor={(n) => ((n.data as NodeData).n.kind === 'territory' ? 'var(--ink)' : (n.data as NodeData).n.color ?? 'var(--line-strong)')}
          maskColor="color-mix(in srgb, var(--bg) 70%, transparent)"
          className="!hidden md:!block"
        />
      </ReactFlow>

      {/* toolbar */}
      <div className="absolute left-3 right-3 top-3 flex flex-wrap items-start gap-2 md:left-4 md:right-auto">
        <div className="relative">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 shadow-[var(--shadow)]">
            <Search size={13} className="text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Trouver un nœud…"
              className="w-[180px] bg-transparent text-[12.5px] outline-none placeholder:text-ink-3"
              aria-label="Rechercher dans la carte"
              onKeyDown={(e) => e.key === 'Enter' && results[0] && reveal(results[0].n.id)}
            />
          </div>
          {results.length > 0 && (
            <div className="absolute left-0 top-9 z-10 w-[340px] rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-lg)]">
              {results.map(({ n }) => (
                <button key={n.id} type="button" onClick={() => reveal(n.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-surface-2">
                  {n.num && <span className="w-14 shrink-0 font-mono text-[10.5px] text-ink-3">{n.num}</span>}
                  <span className="truncate">{n.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex h-8 items-center gap-0.5 rounded-lg border border-line bg-surface px-1 shadow-[var(--shadow)]">
          <IconButton label="Recentrer la vue" onClick={fit}>
            <Focus size={14} />
          </IconButton>
          <IconButton label="Replier les sous-branches" onClick={() => persistOpen(new Set(tree.map((t) => t.id)))}>
            <ChevronsDownUp size={14} />
          </IconButton>
          <IconButton
            label={cross ? 'Masquer les connexions transversales' : 'Afficher les connexions transversales'}
            onClick={() => setCross(!cross)}
            className={cross ? '!text-ink' : ''}
          >
            <Spline size={14} />
          </IconButton>
          <IconButton
            label="Réinitialiser la disposition"
            onClick={async () => {
              persistLayout([])
              persistOpen(new Set(DEFAULT_OPEN))
              setTimeout(fit, 80)
            }}
          >
            <RotateCcw size={14} />
          </IconButton>
          <IconButton label="Plein écran" onClick={fullscreen}>
            <Maximize size={14} />
          </IconButton>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-3 hidden text-right text-[11px] leading-relaxed text-ink-3 md:block">
        Clic : focus et connexions · Double-clic : ouvrir · Glisser un territoire : déplacer sa branche
      </div>

      {/* inspector */}
      {focused && (
        <div className="fade-in absolute bottom-4 left-1/2 w-[min(520px,calc(100%-24px))] -translate-x-1/2 rounded-xl border border-line bg-surface p-3.5 shadow-[var(--shadow-lg)] md:left-auto md:right-16 md:translate-x-0">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                {focused.num && <span className="font-mono">{focused.num}</span>}
                {focused.meta && <span>{focused.meta}</span>}
                {focused.validation && <ValidationBadge value={focused.validation} />}
              </div>
              <div className="text-[13.5px] font-medium leading-snug">{focused.label}</div>
              <div className="mt-1.5 text-[11.5px] text-ink-3">
                {neighbors.get(focused.id)?.size ?? 0} connexion(s) · {focused.children.length} sous-élément(s)
              </div>
            </div>
            <IconButton label="Fermer" onClick={() => setFocus(null)}>
              <X size={14} />
            </IconButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {focused.ref && focused.ref.t !== 'route' && (
              <Button size="sm" variant="primary" icon={<ExternalLink size={12} />} onClick={() => focused.ref && focused.ref.t !== 'route' && openDetail(focused.ref.t, focused.ref.id)}>
                Ouvrir la fiche
              </Button>
            )}
            {focused.ref?.t === 'route' && (
              <Button size="sm" variant="primary" icon={<ExternalLink size={12} />} onClick={() => focused.ref?.t === 'route' && nav(focused.ref.to)}>
                Ouvrir la vue
              </Button>
            )}
            {focused.children.length > 0 && (
              <Button size="sm" onClick={() => toggle(focused.id)}>
                {openSet.has(focused.id) ? 'Replier' : `Déplier (${focused.children.length})`}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
