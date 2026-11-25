import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Thumb } from '../components/images/Thumb'
import { BrandChip, IconButton, Loading, PlatformChip, Select, Tbd, useToast } from '../components/ui'
import { createContent, updateContent } from '../lib/actions'
import { FORMATS, PLATFORM_IDS, PLATFORMS, STAGES } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useById, useContents, useImages } from '../lib/hooks'
import type { BrandId, Content, PlatformId, Stage } from '../lib/types'

export default function Board() {
  const contents = useContents()
  const images = useImages()
  const iById = useById(images)
  const { open } = useDetail()
  const toast = useToast()
  const [brand, setBrand] = useState<BrandId | null>(null)
  const [platform, setPlatform] = useState<PlatformId | null>(null)
  const [q, setQ] = useState('')
  const [over, setOver] = useState<Stage | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const list = useMemo(() => {
    const s = q.toLowerCase()
    return (contents ?? []).filter(
      (c) =>
        (!brand || c.brands.includes(brand)) &&
        (!platform || c.platforms.includes(platform)) &&
        (!s || `${c.id} ${c.subject} ${c.hook}`.toLowerCase().includes(s)),
    )
  }, [contents, brand, platform, q])

  if (!contents) return <Loading />

  const moveTo = async (c: Content, stage: Stage) => {
    if (c.status === stage) return
    if (stage === 'pret' || stage === 'publie') {
      if (c.techValidation === 'requise' || c.techValidation === 'en-cours') {
        toast(`${c.id} : validation technique requise avant « ${STAGES.find((s) => s.id === stage)!.label} »`, 'error')
        return
      }
    }
    await updateContent(c.id, { status: stage })
  }
  const step = (c: Content, d: number) => {
    const i = STAGES.findIndex((s) => s.id === c.status)
    const n = STAGES[i + d]
    if (n) moveTo(c, n.id)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end gap-3 px-4 pb-4 pt-7 md:px-8">
        <div className="mr-auto">
          <div className="eyebrow mb-2">Operations</div>
          <h1 className="display text-[34px] leading-none md:text-[40px]">Production Board</h1>
          <p className="mt-2 max-w-[640px] text-[13px] text-ink-2">
            Glisse une carte d’une colonne à l’autre (ou utilise les flèches). Un contenu dont la validation technique est requise ne peut pas passer en « Prêt à publier ».
          </p>
        </div>
        <input className="input !w-[200px]" placeholder="Filtrer…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="!w-[130px]" allowEmpty emptyLabel="Marque" value={brand} onChange={setBrand} options={[{ value: 'FN', label: 'Fynovates' }, { value: 'TZ', label: 'Tiziana' }]} />
        <Select className="!w-[180px]" allowEmpty emptyLabel="Plateforme" value={platform} onChange={setPlatform} options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))} />
      </div>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-6 scroll-thin md:px-8">
        {STAGES.map((s) => {
          const col = list.filter((c) => c.status === s.id)
          return (
            <div
              key={s.id}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(s.id)
              }}
              onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault()
                setOver(null)
                const c = contents.find((x) => x.id === e.dataTransfer.getData('text/plain'))
                if (c) moveTo(c, s.id)
              }}
              className={clsx(
                'flex w-[272px] shrink-0 flex-col rounded-xl border transition-colors',
                over === s.id ? 'border-ink bg-surface-3' : 'border-line bg-surface-2',
              )}
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-[12.5px] font-semibold">{s.label}</span>
                <span className="text-[11.5px] tabular text-ink-3">{col.length}</span>
                <IconButton
                  label={`Ajouter dans ${s.label}`}
                  className="ml-auto"
                  onClick={async () => open('c', await createContent(brand === 'TZ' ? 'TZ' : 'FN', { status: s.id, platforms: platform ? [platform] : [] }))}
                >
                  <Plus size={13} />
                </IconButton>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2 scroll-thin">
                {col.map((c) => {
                  const img = c.imageIds[0] ? iById.get(c.imageIds[0]) : undefined
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', c.id)
                        e.dataTransfer.effectAllowed = 'move'
                        setDragId(c.id)
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={clsx(
                        'group cursor-grab rounded-lg border border-line bg-surface p-2.5 shadow-[var(--shadow)] active:cursor-grabbing',
                        dragId === c.id && 'opacity-40',
                      )}
                    >
                      <button type="button" className="block w-full text-left" onClick={() => open('c', c.id)}>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
                              <span className="font-mono">{c.id}</span>
                              {c.techValidation === 'requise' && <span className="font-semibold text-[var(--v-expert)]">· VALID. EXPERT</span>}
                            </div>
                            <div className="mt-0.5 line-clamp-3 text-[12.5px] font-medium leading-snug">{c.subject}</div>
                          </div>
                          {img && <Thumb img={img} className="h-12 w-10 shrink-0 rounded object-top" />}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {c.brands.map((b) => (
                            <BrandChip key={b} id={b} compact />
                          ))}
                          {c.platforms.slice(0, 2).map((p) => (
                            <PlatformChip key={p} id={p} compact />
                          ))}
                          {c.platforms.length > 2 && <span className="text-[10.5px] text-ink-3">+{c.platforms.length - 2}</span>}
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-x-2 text-[10.5px] text-ink-3">
                          <span className="truncate">{FORMATS[c.format]}</span>
                          <span className="truncate text-right">{c.publishDate ? new Date(c.publishDate).toLocaleDateString('fr-FR') : 'Date —'}</span>
                          <span className="col-span-2 truncate">
                            Resp. : <Tbd value={c.owner} />
                          </span>
                        </div>
                      </button>
                      <div className="mt-1.5 flex justify-between opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <IconButton label="Étape précédente" onClick={() => step(c, -1)} disabled={c.status === STAGES[0].id}>
                          <ChevronLeft size={13} />
                        </IconButton>
                        <IconButton label="Étape suivante" onClick={() => step(c, 1)} disabled={c.status === 'publie'}>
                          <ChevronRight size={13} />
                        </IconButton>
                      </div>
                    </div>
                  )
                })}
                {col.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-6 text-center text-[11.5px] text-ink-3">Déposer ici</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
