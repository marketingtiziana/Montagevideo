import clsx from 'clsx'
import { Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Page } from '../components/AppShell'
import { ImageCard } from '../components/images/ImageCard'
import { Button, EmptyState, Loading, PageHeader, Section, Select, Tabs, useToast } from '../components/ui'
import { importImages } from '../lib/actions'
import { IMAGE_TYPES, PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { isToClassify, useContents, useImageUsage, useImages } from '../lib/hooks'
import type { BrandId, ImageAsset, ImageType, PlatformId } from '../lib/types'

function useImport() {
  const toast = useToast()
  const { open } = useDetail()
  return async (files: FileList | File[] | null) => {
    if (!files || !files.length) return
    const { added, rejected } = await importImages([...files])
    if (added.length) toast(`${added.length} image(s) importée(s) — ${added[0]}${added.length > 1 ? '…' : ''} dans « Visuels à classer »`)
    rejected.forEach((r) => toast(r, 'error'))
    if (added.length === 1) open('i', added[0])
  }
}

function DropZone({ children }: { children: React.ReactNode }) {
  const doImport = useImport()
  const [over, setOver] = useState(false)
  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        doImport(e.dataTransfer.files)
      }}
      className="relative min-h-full"
    >
      {children}
      {over && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-[rgb(17_17_20/0.25)]">
          <div className="rounded-xl border-2 border-dashed border-white bg-ink/80 px-8 py-6 text-[14px] font-medium text-bg">Déposer pour importer</div>
        </div>
      )}
    </div>
  )
}

function ImportButton() {
  const ref = useRef<HTMLInputElement>(null)
  const doImport = useImport()
  return (
    <>
      <Button variant="primary" icon={<Upload size={14} />} onClick={() => ref.current?.click()}>
        Importer des images
      </Button>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { doImport(e.target.files); e.target.value = '' }} />
    </>
  )
}

export function Library() {
  const images = useImages()
  const contents = useContents()
  const usage = useImageUsage(contents)
  const [tab, setTab] = useState<'all' | 'todo' | 'FN' | 'TZ'>('all')
  const [type, setType] = useState<ImageType | null>(null)
  const [platform, setPlatform] = useState<PlatformId | null>(null)
  const [q, setQ] = useState('')
  const [unused, setUnused] = useState(false)

  const list = useMemo(() => {
    const s = q.toLowerCase()
    return (images ?? [])
      .filter(
        (i) =>
          (tab === 'all' || (tab === 'todo' ? isToClassify(i) : i.brand === (tab as BrandId))) &&
          (!type || i.type === type) &&
          (!platform || i.platform === platform) &&
          (!unused || !usage.get(i.id)?.length) &&
          (!s || `${i.id} ${i.description} ${i.tags.join(' ')} ${i.originalName}`.toLowerCase().includes(s)),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
  }, [images, tab, type, platform, q, unused, usage])

  if (!images) return <Loading />
  return (
    <DropZone>
      <Page wide>
        <PageHeader
          eyebrow="Creative Studio"
          title="Creative Library"
          description="Les images fournies, identifiées IMG-001 à IMG-035, et celles que tu importes. Une image ambiguë reste dans « Visuels à classer » : aucune destination n’est inventée."
          actions={<ImportButton />}
        />
        <Tabs
          className="mb-3"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'Toutes', count: images.length },
            { value: 'todo', label: 'Visuels à classer', count: images.filter(isToClassify).length },
            { value: 'FN', label: 'Fynovates', count: images.filter((i) => i.brand === 'FN').length },
            { value: 'TZ', label: 'Tiziana', count: images.filter((i) => i.brand === 'TZ').length },
          ]}
        />
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <input className="input !w-[240px]" placeholder="Rechercher (ID, tag, description)…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="!w-[210px]" allowEmpty emptyLabel="Type" value={type} onChange={setType} options={(Object.keys(IMAGE_TYPES) as ImageType[]).map((t) => ({ value: t, label: IMAGE_TYPES[t] }))} />
          <Select className="!w-[180px]" allowEmpty emptyLabel="Plateforme" value={platform} onChange={setPlatform} options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))} />
          <label className="flex items-center gap-2 text-[12.5px] text-ink-2">
            <input type="checkbox" checked={unused} onChange={(e) => setUnused(e.target.checked)} /> Non associées
          </label>
          <span className="ml-auto text-[12px] text-ink-3">{list.length} image(s) · glisser-déposer des fichiers pour importer</span>
        </div>
        {list.length === 0 ? (
          <EmptyState title="Aucune image" description="Importe des images ou modifie les filtres." action={<ImportButton />} />
        ) : (
          <div className="columns-2 gap-4 md:columns-3 xl:columns-5">
            {list.map((i) => (
              <ImageCard key={i.id} img={i} usage={usage.get(i.id)?.length} natural />
            ))}
          </div>
        )}
      </Page>
    </DropZone>
  )
}

export function References() {
  const images = useImages()
  const contents = useContents()
  const usage = useImageUsage(contents)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  if (!images) return <Loading />
  const groups: { key: string; label: string; items: ImageAsset[] }[] = [
    { key: 'todo', label: 'VISUELS À CLASSER', items: images.filter(isToClassify) },
    ...(Object.keys(IMAGE_TYPES) as ImageType[])
      .filter((t) => t !== 'a-classer')
      .map((t) => ({ key: t, label: IMAGE_TYPES[t], items: images.filter((i) => i.type === t && !isToClassify(i)) })),
  ]
  return (
    <DropZone>
      <Page wide>
        <PageHeader
          eyebrow="Creative Studio"
          title="Visual References"
          description="Les références classées par type, comme des planches de tendance. Ouvre une image pour lui attribuer une marque, une plateforme et la relier à des contenus."
          actions={<ImportButton />}
        />
        {groups.map((g) => (
          <Section
            key={g.key}
            title={`${g.label} (${g.items.length})`}
            aside={
              <button
                type="button"
                className="text-[12px] text-ink-3 hover:text-ink"
                onClick={() => {
                  const s = new Set(collapsed)
                  if (s.has(g.key)) s.delete(g.key)
                  else s.add(g.key)
                  setCollapsed(s)
                }}
              >
                {collapsed.has(g.key) ? 'Afficher' : 'Masquer'}
              </button>
            }
          >
            {collapsed.has(g.key) ? null : g.items.length === 0 ? (
              <div className={clsx('rounded-lg border border-dashed border-line-strong px-4 py-5 text-[12.5px] text-ink-3')}>
                {g.key === 'photo-tiziana'
                  ? 'Aucune photo réelle de Tiziana importée pour l’instant. Les visuels ne sont jamais générés.'
                  : 'Aucune référence de ce type.'}
              </div>
            ) : (
              <div className="columns-2 gap-4 md:columns-4 xl:columns-6">
                {g.items.map((i) => (
                  <ImageCard key={i.id} img={i} usage={usage.get(i.id)?.length} natural />
                ))}
              </div>
            )}
          </Section>
        ))}
      </Page>
    </DropZone>
  )
}
