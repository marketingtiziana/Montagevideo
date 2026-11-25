import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import clsx from 'clsx'
import { Plus, Trash2 } from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import { Button, Field, IconButton, Loading, Select, Tabs, TextArea, TextInput, ValidationBadge } from '../components/ui'
import { newKey } from '../lib/actions'
import { PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { db } from '../lib/db'
import { useDetail } from '../lib/detail'
import { useContents, useJourneys, useRules } from '../lib/hooks'
import { journeyFor } from '../lib/mapTree'
import type { Journey, JourneyStep, PlatformId } from '../lib/types'

type StepData = { s: JourneyStep; selected: boolean; index: number }

const StepNode = memo(({ data }: NodeProps<Node<StepData>>) => (
  <div className={clsx('w-[230px] rounded-xl border bg-surface p-3.5 shadow-[var(--shadow)]', data.selected ? 'border-ink ring-2 ring-ink/10' : 'border-line')}>
    <Handle type="target" position={Position.Left} isConnectable={false} />
    <Handle type="source" position={Position.Right} isConnectable={false} />
    <div className="mb-1 flex items-center gap-2">
      <span className="display text-[22px] leading-none text-ink-3">{data.index + 1}</span>
      <span className="text-[13.5px] font-semibold">{data.s.label}</span>
    </div>
    <p className="text-[12px] leading-relaxed text-ink-2">{data.s.detail}</p>
    {data.s.platform && (
      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-3">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLATFORMS[data.s.platform].color }} />
        {PLATFORMS[data.s.platform].label}
      </div>
    )}
  </div>
))
const nodeTypes = { step: StepNode }

export default function JourneysView() {
  return (
    <ReactFlowProvider>
      <Journeys />
    </ReactFlowProvider>
  )
}

function Journeys() {
  const journeys = useJourneys()
  const rules = useRules()
  const contents = useContents()
  const { open } = useDetail()
  const [jid, setJid] = useState('J-DECOUVERTE')
  const [sel, setSel] = useState<string | null>(null)
  const j = journeys?.find((x) => x.id === jid)

  const nodes: Node<StepData>[] = useMemo(
    () => (j ? j.steps.map((s, i) => ({ id: s.id, type: 'step', position: { x: s.x, y: s.y }, data: { s, selected: sel === s.id, index: i } })) : []),
    [j, sel],
  )
  const edges = useMemo(
    () =>
      j
        ? j.edges.map((e) => ({
            id: e.id,
            source: e.from,
            target: e.to,
            label: e.label,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--ink-3)' },
            style: { stroke: 'var(--ink-3)', strokeWidth: 1.4 },
          }))
        : [],
    [j],
  )
  if (!journeys || !rules || !contents) return <Loading />
  if (!j) return null

  const save = (patch: Partial<Journey>) => db.journeys.update(j.id, patch)
  const step = j.steps.find((s) => s.id === sel)
  const feeding = contents.filter((c) => journeyFor(c) === j.id)

  const addStep = () => {
    const last = j.steps[j.steps.length - 1]
    const s: JourneyStep = { id: newKey(), label: 'Nouvelle étape', detail: '', platform: null, x: (last?.x ?? -300) + 300, y: last?.y ?? 0 }
    save({ steps: [...j.steps, s], edges: last ? [...j.edges, { id: newKey(), from: last.id, to: s.id }] : j.edges })
    setSel(s.id)
  }
  const removeStep = (id: string) => {
    const idx = j.steps.findIndex((s) => s.id === id)
    const prev = j.steps[idx - 1]
    const next = j.steps[idx + 1]
    const edges = j.edges.filter((e) => e.from !== id && e.to !== id)
    if (prev && next) edges.push({ id: newKey(), from: prev.id, to: next.id })
    save({ steps: j.steps.filter((s) => s.id !== id), edges })
    setSel(null)
  }
  const updStep = (patch: Partial<JourneyStep>) => step && save({ steps: j.steps.map((s) => (s.id === step.id ? { ...s, ...patch } : s)) })

  return (
    <div className="flex h-full flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
        <div className="border-b border-line px-4 pb-3 pt-6 md:px-8">
          <div className="eyebrow mb-2">Operations</div>
          <h1 className="display text-[34px] leading-none md:text-[40px]">Conversion Journeys</h1>
          <Tabs className="mt-4" value={jid} onChange={(v) => { setJid(v); setSel(null) }} items={journeys.map((x) => ({ value: x.id, label: x.name, count: x.steps.length }))} />
        </div>
        <div className="relative min-h-0 flex-1">
          <ReactFlow
            key={j.id}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesConnectable={false}
            onNodeClick={(_, n) => setSel(n.id)}
            onPaneClick={() => setSel(null)}
            onNodeDragStop={(_, n) => save({ steps: j.steps.map((s) => (s.id === n.id ? { ...s, x: n.position.x, y: n.position.y } : s)) })}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--line-strong)" />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>
          <div className="absolute left-4 top-4 flex gap-2">
            <Button size="sm" icon={<Plus size={12} />} onClick={addStep}>
              Étape
            </Button>
          </div>
        </div>
      </div>
      <aside className="w-full shrink-0 overflow-y-auto border-t border-line bg-surface p-5 scroll-thin lg:w-[360px] lg:border-l lg:border-t-0">
        {step ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Étape</span>
              <IconButton label="Supprimer l’étape" onClick={() => removeStep(step.id)}>
                <Trash2 size={13} />
              </IconButton>
            </div>
            <Field label="Libellé">
              <TextInput value={step.label} onCommit={(v) => updStep({ label: v })} />
            </Field>
            <Field label="Détail">
              <TextArea value={step.detail} onCommit={(v) => updStep({ detail: v })} />
            </Field>
            <Field label="Plateforme">
              <Select<PlatformId>
                value={step.platform}
                allowEmpty
                emptyLabel="Aucune"
                onChange={(v) => updStep({ platform: v })}
                options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))}
              />
            </Field>
            <Button size="sm" variant="ghost" onClick={() => setSel(null)}>
              ← Retour au parcours
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold">{j.name}</h2>
                <ValidationBadge value={j.validation} />
              </div>
              <TextArea value={j.summary} onCommit={(v) => save({ summary: v })} rows={2} className="text-[12.5px]" />
            </div>
            <div>
              <div className="eyebrow mb-2">Règles de conversion</div>
              <ul className="space-y-1.5">
                {rules
                  .filter((r) => r.scope === 'Conversion')
                  .map((r) => (
                    <li key={r.id} className="flex gap-2 text-[12.5px] leading-relaxed">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                      {r.text}
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-2">Contenus qui alimentent ce parcours ({feeding.length})</div>
              <p className="mb-2 text-[11.5px] text-ink-3">Déduit du CTA de chaque contenu.</p>
              <div className="space-y-1">
                {feeding.slice(0, 40).map((c) => (
                  <button key={c.id} type="button" onClick={() => open('c', c.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] hover:bg-surface-2">
                    <span className="w-[50px] shrink-0 font-mono text-[10.5px] text-ink-3">{c.id}</span>
                    <span className="truncate">{c.subject}</span>
                  </button>
                ))}
                {feeding.length === 0 && <div className="text-[12px] text-ink-3">Aucun contenu pour l’instant.</div>}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
