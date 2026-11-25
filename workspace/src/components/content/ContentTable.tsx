import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type SortingState,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createContent, updateContent, type ContentKind } from '../../lib/actions'
import {
  FORMAT_IDS,
  FORMATS,
  OBJECTIVES,
  PILLAR_IDS,
  PILLARS,
  PLATFORM_IDS,
  PLATFORMS,
  STAGE_LABEL,
  STAGES,
  VALIDATIONS,
} from '../../lib/constants'
import { useDetail } from '../../lib/detail'
import { useById, useImages, useProblems } from '../../lib/hooks'
import type { BrandId, Content, Format, Objective, PillarId, PlatformId, Stage, Validation } from '../../lib/types'
import { Thumb } from '../images/Thumb'
import { BrandChip, Button, EmptyState, PillarChip, PlatformChip, Select, Tabs, Tbd, ValidationBadge } from '../ui'

export type ViewId = 'all' | 'FN' | 'TZ' | 'ig' | 'tt' | 'li' | 'yt'
const VIEWS: { value: ViewId; label: string; test: (c: Content) => boolean }[] = [
  { value: 'all', label: 'Tous les contenus', test: () => true },
  { value: 'FN', label: 'Fynovates', test: (c) => c.brands.includes('FN') },
  { value: 'TZ', label: 'Tiziana', test: (c) => c.brands.includes('TZ') },
  { value: 'ig', label: 'Instagram', test: (c) => c.platforms.some((p) => p.startsWith('ig')) },
  { value: 'tt', label: 'TikTok', test: (c) => c.platforms.includes('tt-fn') },
  { value: 'li', label: 'LinkedIn', test: (c) => c.platforms.some((p) => p.startsWith('li')) },
  { value: 'yt', label: 'YouTube', test: (c) => c.platforms.includes('yt-fn') },
]
type GroupBy = 'none' | 'pillar' | 'format' | 'status' | 'objective'

const col = createColumnHelper<Content>()

const textFilter: FilterFn<Content> = (row, _id, q: string) => {
  const c = row.original
  const s = q.toLowerCase()
  return `${c.id} ${c.subject} ${c.hook} ${c.cta} ${c.angle} ${c.notes}`.toLowerCase().includes(s)
}

export function ContentTable({
  contents,
  showViews = true,
  defaultCreate,
  initialView = 'all',
}: {
  contents: Content[]
  showViews?: boolean
  defaultCreate?: { kind: ContentKind; platforms: PlatformId[] }
  initialView?: ViewId
}) {
  const problems = useProblems()
  const images = useImages()
  const pById = useById(problems)
  const iById = useById(images)
  const { open } = useDetail()
  const [view, setView] = useState<ViewId>(initialView)
  const [q, setQ] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }])
  const [f, setF] = useState<{
    brand: BrandId | null
    platform: PlatformId | null
    pillar: PillarId | null
    format: Format | null
    status: Stage | null
    validation: Validation | null
    objective: Objective | null
  }>({ brand: null, platform: null, pillar: null, format: null, status: null, validation: null, objective: null })
  const [groupBy, setGroupBy] = useState<GroupBy>('none')

  const data = useMemo(() => {
    const v = VIEWS.find((x) => x.value === view)!
    return contents.filter(
      (c) =>
        v.test(c) &&
        (!f.brand || c.brands.includes(f.brand)) &&
        (!f.platform || c.platforms.includes(f.platform)) &&
        (!f.pillar || c.pillar === f.pillar) &&
        (!f.format || c.format === f.format) &&
        (!f.status || c.status === f.status) &&
        (!f.validation || c.validation === f.validation) &&
        (!f.objective || c.objective === f.objective),
    )
  }, [contents, view, f])

  const columns = useMemo(
    () => [
      col.accessor('id', {
        header: 'ID',
        size: 72,
        cell: (i) => <span className="font-mono text-[11.5px] text-ink-2">{i.getValue()}</span>,
      }),
      col.accessor((c) => c.problemIds.map((p) => pById.get(p)?.title ?? p).join(' · '), {
        id: 'problem',
        header: 'Problématique',
        size: 200,
        cell: (i) => <span className="line-clamp-2 text-[12px] text-ink-2">{i.getValue() || <Tbd />}</span>,
      }),
      col.accessor((c) => c.hook || c.subject, {
        id: 'hook',
        header: 'Accroche',
        size: 300,
        cell: (i) => (
          <div>
            <div className="line-clamp-2 text-[13px] text-ink">{i.getValue()}</div>
            {i.row.original.hook && i.row.original.subject !== i.row.original.hook && (
              <div className="mt-0.5 truncate text-[11px] text-ink-3">{i.row.original.subject}</div>
            )}
          </div>
        ),
      }),
      col.accessor((c) => c.brands.join(','), {
        id: 'brand',
        header: 'Marque',
        size: 70,
        cell: (i) => (
          <div className="flex flex-col gap-0.5">
            {i.row.original.brands.map((b) => (
              <BrandChip key={b} id={b} compact />
            ))}
          </div>
        ),
      }),
      col.accessor((c) => c.platforms.join(','), {
        id: 'platform',
        header: 'Plateforme',
        size: 150,
        enableSorting: false,
        cell: (i) => (
          <div className="flex flex-wrap gap-1">
            {i.row.original.platforms.length ? i.row.original.platforms.map((p) => <PlatformChip key={p} id={p} compact />) : <Tbd />}
          </div>
        ),
      }),
      col.accessor((c) => c.pillar ?? 'Z', {
        id: 'pillar',
        header: 'Pilier',
        size: 110,
        cell: (i) => (i.row.original.pillar ? <PillarChip id={i.row.original.pillar} /> : <Tbd />),
      }),
      col.accessor((c) => FORMATS[c.format], {
        id: 'format',
        header: 'Format',
        size: 140,
        cell: (i) => <span className="text-[12px] text-ink-2">{i.getValue()}</span>,
      }),
      col.accessor((c) => (c.objective ? OBJECTIVES[c.objective] : ''), {
        id: 'objective',
        header: 'Objectif',
        size: 110,
        cell: (i) => <span className="text-[12px] text-ink-2">{i.getValue() || <Tbd />}</span>,
      }),
      col.accessor('cta', {
        header: 'CTA',
        size: 160,
        cell: (i) => <span className="line-clamp-2 text-[12px] text-ink-2">{i.getValue() || <Tbd />}</span>,
      }),
      col.accessor((c) => c.imageIds.length, {
        id: 'ref',
        header: 'Réf. visuelle',
        size: 96,
        cell: (i) => {
          const ids = i.row.original.imageIds
          if (!ids.length) return <Tbd />
          return (
            <div className="flex items-center gap-1">
              {ids.slice(0, 2).map((id) => (
                <Thumb key={id} img={iById.get(id)} className="h-8 w-8 rounded border border-line object-top" />
              ))}
              {ids.length > 2 && <span className="text-[11px] text-ink-3">+{ids.length - 2}</span>}
            </div>
          )
        },
      }),
      col.accessor((c) => STAGES.findIndex((s) => s.id === c.status), {
        id: 'status',
        header: 'Statut',
        size: 170,
        cell: (i) => {
          const c = i.row.original
          return (
            <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
              <Select<Stage>
                className="!h-7 !py-0 text-[12px]"
                value={c.status}
                onChange={(v) => v && updateContent(c.id, { status: v })}
                options={STAGES.map((s) => ({ value: s.id, label: s.label }))}
              />
              <ValidationBadge value={c.validation} />
            </div>
          )
        },
      }),
    ],
    [pById, iById],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: q },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQ,
    globalFilterFn: textFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows
  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'all', label: '', rows }]
    const keyOf = (c: Content): [string, string] => {
      if (groupBy === 'pillar') return c.pillar ? [c.pillar, `${c.pillar} — ${PILLARS[c.pillar].label}`] : ['~', 'Sans pilier']
      if (groupBy === 'format') return [c.format, FORMATS[c.format]]
      if (groupBy === 'status') return [String(STAGES.findIndex((s) => s.id === c.status)), STAGE_LABEL[c.status]]
      return c.objective ? [c.objective, OBJECTIVES[c.objective]] : ['~', 'Objectif à renseigner']
    }
    const m = new Map<string, { key: string; label: string; rows: typeof rows }>()
    for (const r of rows) {
      const [k, label] = keyOf(r.original)
      if (!m.has(k)) m.set(k, { key: k, label, rows: [] })
      m.get(k)!.rows.push(r)
    }
    return [...m.values()].sort((a, b) => a.key.localeCompare(b.key))
  }, [rows, groupBy])

  const activeFilters = Object.values(f).filter(Boolean).length + (q ? 1 : 0)

  const create = async () => {
    const kind = defaultCreate?.kind ?? (view === 'TZ' ? 'TZ' : 'FN')
    const id = await createContent(kind, {
      platforms: defaultCreate?.platforms ?? (f.platform ? [f.platform] : []),
      pillar: f.pillar,
      format: f.format ?? 'reel',
    })
    open('c', id)
  }

  return (
    <div>
      {showViews && <Tabs className="mb-3" value={view} onChange={setView} items={VIEWS.map((v) => ({ value: v.value, label: v.label, count: contents.filter(v.test).length }))} />}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input className="input !w-[240px]" placeholder="Rechercher dans les contenus…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
        <Select className="!w-[130px]" allowEmpty emptyLabel="Marque" value={f.brand} onChange={(v) => setF({ ...f, brand: v })} options={[{ value: 'FN', label: 'Fynovates' }, { value: 'TZ', label: 'Tiziana' }]} />
        <Select className="!w-[170px]" allowEmpty emptyLabel="Plateforme" value={f.platform} onChange={(v) => setF({ ...f, platform: v })} options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))} />
        <Select className="!w-[140px]" allowEmpty emptyLabel="Pilier" value={f.pillar} onChange={(v) => setF({ ...f, pillar: v })} options={PILLAR_IDS.map((p) => ({ value: p, label: `${p} — ${PILLARS[p].short}` }))} />
        <Select className="!w-[160px]" allowEmpty emptyLabel="Format" value={f.format} onChange={(v) => setF({ ...f, format: v })} options={FORMAT_IDS.map((x) => ({ value: x, label: FORMATS[x] }))} />
        <Select className="!w-[160px]" allowEmpty emptyLabel="Statut" value={f.status} onChange={(v) => setF({ ...f, status: v })} options={STAGES.map((s) => ({ value: s.id, label: s.label }))} />
        <Select className="!w-[190px]" allowEmpty emptyLabel="Validation" value={f.validation} onChange={(v) => setF({ ...f, validation: v })} options={VALIDATIONS.map((v) => ({ value: v, label: v }))} />
        <Select className="!w-[150px]" allowEmpty emptyLabel="Objectif" value={f.objective} onChange={(v) => setF({ ...f, objective: v })} options={(Object.keys(OBJECTIVES) as Objective[]).map((o) => ({ value: o, label: OBJECTIVES[o] }))} />
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ('')
              setF({ brand: null, platform: null, pillar: null, format: null, status: null, validation: null, objective: null })
            }}
          >
            Effacer ({activeFilters})
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select<GroupBy>
            className="!w-[170px]"
            value={groupBy}
            onChange={(v) => setGroupBy(v ?? 'none')}
            options={[
              { value: 'none', label: 'Sans regroupement' },
              { value: 'pillar', label: 'Par pilier' },
              { value: 'format', label: 'Par format' },
              { value: 'status', label: 'Par statut' },
              { value: 'objective', label: 'Par objectif' },
            ]}
          />
          <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={create}>
            Ajouter
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface scroll-thin">
        <table className="w-full min-w-[1320px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-2">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} style={{ width: h.getSize() }} className="border-b border-line px-3 py-2 text-[11px] font-medium text-ink-3">
                    {h.column.getCanSort() ? (
                      <button type="button" className="inline-flex items-center gap-1 hover:text-ink" onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc' && <ArrowUp size={11} />}
                        {h.column.getIsSorted() === 'desc' && <ArrowDown size={11} />}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows key={g.key} label={g.label} count={g.rows.length} colSpan={columns.length}>
                {g.rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => open('c', r.original.id)}
                    className={clsx('cursor-pointer border-b border-line align-top transition-colors last:border-0 hover:bg-surface-2')}
                  >
                    {r.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </GroupRows>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <EmptyState
            className="m-4"
            title="Aucun contenu ne correspond"
            description="Modifie les filtres ou ajoute un nouveau contenu."
            action={
              <Button size="sm" onClick={create} icon={<Plus size={13} />}>
                Ajouter un contenu
              </Button>
            }
          />
        )}
      </div>
      <div className="mt-2 text-[11.5px] text-ink-3">
        {rows.length} contenu(s) affiché(s) sur {contents.length}
      </div>
    </div>
  )
}

function GroupRows({ label, count, colSpan, children }: { label: string; count: number; colSpan: number; children: React.ReactNode }) {
  return (
    <>
      {label && (
        <tr className="bg-bg">
          <td colSpan={colSpan} className="border-b border-line px-3 py-2 text-[12px] font-semibold text-ink">
            {label} <span className="ml-1 font-normal text-ink-3">{count}</span>
          </td>
        </tr>
      )}
      {children}
    </>
  )
}
