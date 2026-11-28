import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Paperclip, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import {
  ApprovalBadge,
  EvidenceCard,
  IdentityBar,
  Markdown,
  SectionCard,
  SectionPanel,
  StatusBadge,
  useBrandReady,
  useIdentity,
  type PanelTab,
} from '../../components/brand/BrandParts'
import { Thumb } from '../../components/images/Thumb'
import { Button, EmptyState, Loading, Tabs } from '../../components/ui'
import { DOCS, parsedDocs, type DocId } from '../../lib/brand/docs'
import { bdb, download, exportMarkdown } from '../../lib/brand/store'
import { getImage } from '../../lib/hooks'
import { charters } from '../../lib/seed/da'

type View = 'document' | 'assets' | 'history'

export default function BrandDoc({ docOverride }: { docOverride?: DocId }) {
  const params = useParams<{ doc: DocId }>()
  const doc = (docOverride ?? params.doc) as DocId
  const meta = DOCS[doc]
  const { ready, error } = useBrandReady()
  const id = useIdentity()
  const [view, setView] = useState<View>('document')
  const [panel, setPanel] = useState<{ key: string; tab: PanelTab } | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const loc = useLocation()
  const sections = useLiveQuery(() => (meta ? bdb.sections.where('doc').equals(doc).sortBy('order') : []), [doc], undefined)
  const chapters = parsedDocs[doc]?.chapters ?? []

  useEffect(() => {
    if (!loc.hash || !sections) return
    const t = setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => clearTimeout(t)
  }, [loc.hash, sections])

  const filtered = useMemo(
    () =>
      (sections ?? []).filter(
        (s) =>
          statusFilter === 'all' ||
          (statusFilter === 'approved' ? s.approval === 'approved' : statusFilter === 'pending' ? s.approval !== 'approved' : statusFilter === 'tovalidate' ? s.status === 'À VALIDER' || /> À VALIDER/.test(s.body) : s.status === statusFilter),
      ),
    [sections, statusFilter],
  )

  if (!meta) return <Page><EmptyState title="Document introuvable" /></Page>
  if (error) return <Page><EmptyState title="Impossible d’ouvrir le document" description={error} /></Page>
  if (!ready || !sections) return <Loading />

  const approved = sections.filter((s) => s.approval === 'approved').length
  const exportMd = async (notes: boolean) => download(meta.file.replace('.md', notes ? '_avec-notes.md' : '.md'), await exportMarkdown(doc, { notes }))

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-8 md:px-8">
      {/* TOC */}
      <nav aria-label="Sommaire" className="no-print sticky top-4 hidden max-h-[calc(100vh-7rem)] w-[260px] shrink-0 self-start overflow-y-auto pr-2 scroll-thin xl:block">
        <Link to="/brand-strategy" className="text-[12px] text-ink-3 hover:text-ink">
          ← Brand Strategy
        </Link>
        <div className="mt-4 space-y-4">
          {chapters.map((ch) => (
            <div key={ch.id}>
              <a href={`#c-${ch.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`c-${ch.id}`)?.scrollIntoView({ behavior: 'smooth' }) }} className="block text-[12px] font-semibold leading-snug text-ink hover:underline">
                {ch.title}
              </a>
              <ul className="mt-1 space-y-0.5">
                {sections
                  .filter((s) => s.chapter === ch.id)
                  .map((s) => (
                    <li key={s.key}>
                      <a
                        href={`#s-${s.sid}`}
                        onClick={(e) => { e.preventDefault(); setView('document'); setTimeout(() => document.getElementById(`s-${s.sid}`)?.scrollIntoView({ behavior: 'smooth' }), 30) }}
                        className="flex items-start gap-1.5 rounded px-1 py-0.5 text-[11.5px] leading-snug text-ink-3 hover:bg-surface-2 hover:text-ink"
                      >
                        <span className={clsx('mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full', s.approval === 'approved' ? 'bg-[var(--v-ok)]' : s.approval === 'review' ? 'bg-[var(--v-idea)]' : 'bg-line-strong')} />
                        <span>
                          {s.sid} {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <header className="mb-6 border-b border-line pb-6">
          <div className="mb-3 h-1 w-16 rounded-full" style={{ background: meta.color }} />
          <div className="eyebrow mb-2">Brand Strategy</div>
          <h1 className="display text-[34px] leading-[1.05] md:text-[42px]">{parsedDocs[doc].title || meta.title}</h1>
          <p className="mt-2 max-w-[70ch] text-[14px] text-ink-2">{meta.audience}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-ink-3">
              {approved} / {sections.length} sections approuvées
            </span>
            <div className="no-print ml-auto flex flex-wrap gap-2">
              <Button size="sm" icon={<Download size={13} />} onClick={() => exportMd(false)}>
                Markdown
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportMd(true)}>
                Markdown + notes
              </Button>
              <Link to={`/brand-strategy/${doc}/print`} target="_blank" className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line bg-surface px-2.5 text-[12.5px] font-medium hover:border-line-strong">
                <Printer size={13} /> PDF
              </Link>
            </div>
          </div>
          <div className="no-print mt-4 flex flex-wrap items-center gap-3">
            <IdentityBar id={id} />
          </div>
          <Tabs
            className="no-print mt-5"
            value={view}
            onChange={setView}
            items={[
              { value: 'document', label: 'Document' },
              { value: 'assets', label: 'Références & assets' },
              { value: 'history', label: 'Activité récente' },
            ]}
          />
        </header>

        {view === 'document' && (
          <>
            <div className="no-print mb-2 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="text-ink-3">Afficher :</span>
              {[
                ['all', 'Tout'],
                ['tovalidate', 'Points à valider'],
                ['pending', 'Non approuvé'],
                ['approved', 'Approuvé'],
                ['HYPOTHÈSE', 'Hypothèses'],
                ['CONFIRMÉ', 'Confirmé'],
              ].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setStatusFilter(v)} className={clsx('rounded-md border px-2 py-0.5', statusFilter === v ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink-2')}>
                  {l}
                </button>
              ))}
            </div>
            {parsedDocs[doc].intro && <Markdown md={parsedDocs[doc].intro} className="mb-2 text-ink-2" />}
            {chapters.map((ch) => {
              const list = filtered.filter((s) => s.chapter === ch.id)
              if (!list.length) return null
              return (
                <section key={ch.id} id={`c-${ch.id}`} className="print-chapter mt-10 scroll-mt-6">
                  <h2 className="display border-b border-line pb-3 text-[28px] leading-tight">{ch.title}</h2>
                  {list.map((s) => (
                    <SectionCard key={s.key} s={s} id={id} onOpenPanel={(key, tab) => setPanel({ key, tab })} />
                  ))}
                </section>
              )
            })}
            {filtered.length === 0 && <EmptyState className="mt-6" title="Aucune section ne correspond à ce filtre" />}
          </>
        )}

        {view === 'assets' && <AssetsView doc={doc} id={id} openDocPanel={() => setPanel({ key: `${doc}:*`, tab: 'evidence' })} />}
        {view === 'history' && <ActivityView doc={doc} openSection={(key) => setPanel({ key, tab: 'history' })} />}
      </div>

      <SectionPanel doc={doc} sectionKey={panel?.key ?? null} tab={panel?.tab ?? 'notes'} setTab={(t) => panel && setPanel({ ...panel, tab: t })} onClose={() => setPanel(null)} id={id} />
    </div>
  )
}

function AssetsView({ doc, id, openDocPanel }: { doc: DocId; id: ReturnType<typeof useIdentity>; openDocPanel: () => void }) {
  const evidence = useLiveQuery(() => bdb.evidence.where('doc').equals(doc).reverse().sortBy('createdAt'), [doc], [])
  const brand = doc === 'tz' ? 'TZ' : 'FN'
  const ch = charters[brand]
  const refs = (doc === 'align' ? [...charters.FN.examples.slice(0, 4), ...charters.TZ.examples.slice(0, 2)] : ch.examples).map(getImage).filter(Boolean)
  const approved = evidence.filter((e) => e.approved)
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Assets approuvés ({approved.length})</h2>
        {approved.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-5 text-[12.5px] text-ink-3">
            Aucun asset approuvé. Un valideur peut cocher « Asset approuvé » sur une référence importée ci-dessous ou dans une section.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {approved.map((r) => (
              <EvidenceCard key={r.id} r={r} id={id} />
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Toutes les références du document ({evidence.length})</h2>
          {id.canEdit && (
            <Button size="sm" icon={<Paperclip size={13} />} onClick={openDocPanel}>
              Ajouter une référence au document
            </Button>
          )}
        </div>
        {evidence.length === 0 ? (
          <div className="text-[12.5px] text-ink-3">Aucune référence importée pour l’instant. Les références ajoutées à une section apparaissent aussi ici.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {evidence.map((r) => (
              <EvidenceCard key={r.id} r={r} id={id} />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-1 text-[15px] font-semibold">Références visuelles du guide</h2>
        <p className="mb-3 text-[12.5px] text-ink-3">Issues de la galerie visuelle. {doc === 'tz' && 'Aucune n’est une photo réelle validée de Tiziana.'}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          {refs.map((img) => (
            <Link key={img!.id} to={`/gallery?i=${img!.id}`} className="overflow-hidden rounded-lg border border-line bg-surface">
              <Thumb img={img} className="aspect-square w-full object-top" />
              <div className="px-2 py-1 font-mono text-[10.5px] text-ink-3">{img!.id}</div>
            </Link>
          ))}
        </div>
      </section>
      {doc !== 'align' && (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">{doc === 'fn' ? 'Palette' : 'Tonalités (indicatives)'}</h2>
          <div className="flex flex-wrap gap-2">
            {ch.palette.map((p) => (
              <div key={p.hex} className="overflow-hidden rounded-lg border border-line bg-surface">
                <div className="h-12 w-28" style={{ background: p.hex }} />
                <div className="px-2 py-1.5 text-[11px]">
                  <div className="font-medium">{p.name}</div>
                  <div className="font-mono text-ink-3">{p.hex}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/brand-strategy/assets" className="mt-3 inline-block text-[12.5px] text-ink-3 hover:text-ink">
            Guidelines complètes des assets →
          </Link>
        </section>
      )}
    </div>
  )
}

function ActivityView({ doc, openSection }: { doc: DocId; openSection: (key: string) => void }) {
  const versions = useLiveQuery(() => bdb.versions.where('doc').equals(doc).reverse().sortBy('savedAt'), [doc], [])
  const sections = useLiveQuery(() => bdb.sections.where('doc').equals(doc).toArray(), [doc], [])
  const notes = useLiveQuery(() => bdb.notes.where('doc').equals(doc).reverse().sortBy('createdAt'), [doc], [])
  const byKey = new Map(sections.map((s) => [s.key, s]))
  const items = [
    ...versions.filter((v) => v.label !== 'Version initiale').map((v) => ({ t: v.savedAt, key: v.key, what: v.label, who: v.author })),
    ...notes.map((n) => ({ t: n.createdAt, key: n.key, what: 'Note ajoutée', who: n.author })),
    ...sections.filter((s) => s.approvedAt).map((s) => ({ t: s.approvedAt!, key: s.key, what: 'Section approuvée', who: s.approvedBy })),
  ].sort((a, b) => b.t - a.t)
  if (!items.length) return <EmptyState title="Aucune activité" description="Les modifications, notes et approbations apparaîtront ici." />
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-surface">
      {items.slice(0, 100).map((it, i) => {
        const s = byKey.get(it.key)
        return (
          <button key={i} type="button" onClick={() => s && openSection(it.key)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-left hover:bg-surface-2">
            <span className="w-[140px] text-[12px] text-ink-3">{new Date(it.t).toLocaleString('fr-FR')}</span>
            <span className="text-[12.5px] font-medium">{it.what}</span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-2">{s ? `${s.sid} ${s.title}` : 'Document'}</span>
            {s && <StatusBadge s={s.status} />}
            {s && <ApprovalBadge a={s.approval} />}
            <span className="text-[11.5px] text-ink-3">{it.who}</span>
          </button>
        )
      })}
    </div>
  )
}
