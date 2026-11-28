import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Copy, Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { ApprovalBadge, Markdown, StatusBadge, useBrandReady } from '../../components/brand/BrandParts'
import { Button, EmptyState, Loading, PageHeader, Section, useToast } from '../../components/ui'
import { compileContext, CONTENT_TYPES, CONTEXT_LABEL } from '../../lib/brand/context'
import { DOCS, parsedDocs, type DocId } from '../../lib/brand/docs'
import { approvalLabel, bdb, download, exportRegister } from '../../lib/brand/store'

/* ---------------- Approval register ---------------- */

export function Register() {
  const { ready } = useBrandReady()
  const sections = useLiveQuery(() => bdb.sections.toArray(), [], [])
  const [doc, setDoc] = useState<DocId | 'all'>('all')
  if (!ready) return <Loading />
  const docs = (Object.keys(DOCS) as DocId[]).filter((d) => doc === 'all' || d === doc)
  return (
    <Page wide>
      <PageHeader
        eyebrow="Brand Strategy"
        title="Registre d’approbation"
        description="L’état de validation de chaque section des documents de marque. Une section modifiée après approbation repasse automatiquement « En revue »."
        actions={
          <Button icon={<Download size={13} />} onClick={async () => download('BRAND_APPROVAL_REGISTER.md', await exportRegister())}>
            Exporter (.md)
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
        {(['all', ...Object.keys(DOCS)] as (DocId | 'all')[]).map((d) => (
          <button key={d} type="button" onClick={() => setDoc(d)} className={`rounded-md border px-2 py-0.5 ${doc === d ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink-2'}`}>
            {d === 'all' ? 'Tous' : DOCS[d].short}
          </button>
        ))}
      </div>
      {docs.map((d) => {
        const list = sections.filter((s) => s.doc === d).sort((a, b) => a.order - b.order)
        const counts = { draft: 0, review: 0, approved: 0 }
        list.forEach((s) => counts[s.approval]++)
        return (
          <Section key={d} title={DOCS[d].title} aside={<span className="text-[12px] text-ink-3">{counts.approved} approuvées · {counts.review} en revue · {counts.draft} brouillons</span>}>
            <div className="overflow-x-auto rounded-xl border border-line bg-surface scroll-thin">
              <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-surface-2 text-left text-[11px] text-ink-3">
                    <th className="px-3 py-2 font-medium">Section</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium">Approbation</th>
                    <th className="px-3 py-2 font-medium">Valideur</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Dernière modification</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.key} className="border-t border-line">
                      <td className="px-3 py-2">
                        <Link to={`/brand-strategy/${d}#s-${s.sid}`} className="hover:underline">
                          <span className="font-mono text-ink-3">{s.sid}</span> {s.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2"><StatusBadge s={s.status} /></td>
                      <td className="px-3 py-2"><ApprovalBadge a={s.approval} /></td>
                      <td className="px-3 py-2">{s.approvedBy || '—'}</td>
                      <td className="px-3 py-2">{s.approvedAt ? new Date(s.approvedAt).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-3 py-2 text-ink-3">{s.edited ? `${new Date(s.updatedAt).toLocaleDateString('fr-FR')} · ${s.updatedBy}` : 'Version initiale'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )
      })}
      <p className="text-[11.5px] text-ink-3">États : {(['draft', 'review', 'approved'] as const).map(approvalLabel).join(' · ')}.</p>
    </Page>
  )
}

/* ---------------- Brand context (AI) ---------------- */

export function ContextPack() {
  const { ready } = useBrandReady()
  const sections = useLiveQuery(() => bdb.sections.toArray(), [], [])
  const [params, setParams] = useSearchParams()
  const typeId = params.get('type') ?? 'fn-post'
  const type = CONTENT_TYPES.find((t) => t.id === typeId) ?? CONTENT_TYPES[0]
  const [full, setFull] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  const text = useMemo(() => compileContext(type, sections, full), [type, sections, full])
  if (!ready) return <Loading />
  const groups = ['FYNOVATES', 'Tiziana', 'Double'] as const
  const words = text.split(/\s+/).length

  return (
    <Page wide>
      <PageHeader
        eyebrow="Brand Strategy"
        title="Contexte de marque"
        description="Le contexte à fournir à un outil d’IA (rédaction, script, présentation, direction visuelle) selon le type de contenu produit. Il est construit à partir de l’état actuel des playbooks : chaque modification ou approbation y est reportée."
      />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <div className="eyebrow mb-1.5">{g}</div>
              <div className="space-y-1">
                {CONTENT_TYPES.filter((t) => t.group === g).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setParams({ type: t.id })}
                    className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[12.5px] ${t.id === type.id ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-2'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <div className="mb-4 rounded-xl border border-line bg-surface p-4">
            <div className="text-[13px] font-semibold">{type.label}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {type.contexts.map((c) => (
                <span key={c} className="rounded-md border px-2 py-0.5 text-[12px] font-medium" style={{ borderColor: c === 'corporate' ? 'var(--c-fn)' : 'var(--c-tz)', color: c === 'corporate' ? 'var(--c-fn)' : 'var(--c-tz)' }}>
                  {CONTEXT_LABEL[c]}
                </span>
              ))}
              <span className="rounded-md border border-line px-2 py-0.5 text-[12px] font-medium text-ink-2">+ ALIGNEMENT (toujours)</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
                <input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} /> Playbooks complets (sinon : chapitres essentiels)
              </label>
              <span className="text-[11.5px] text-ink-3">≈ {words.toLocaleString('fr-FR')} mots</span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  icon={copied ? <Check size={13} /> : <Copy size={13} />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(text)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    } catch {
                      toast('Copie impossible : utilise le téléchargement', 'error')
                    }
                  }}
                >
                  Copier
                </Button>
                <Button size="sm" icon={<Download size={13} />} onClick={() => download(`CONTEXTE_${type.id}.md`, text)}>
                  Télécharger
                </Button>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-ink-3">
              Les fiches d’idées et de long formats du guide indiquent leur contexte et y renvoient directement. Une opinion de Tiziana n’est jamais utilisée comme position officielle de FYNOVATES, et inversement.
            </p>
          </div>
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 font-mono text-[11.5px] leading-[1.6] scroll-thin">{text}</pre>
        </div>
      </div>
    </Page>
  )
}

/* ---------------- Print (PDF) ---------------- */

export function PrintDoc() {
  const { doc } = useParams<{ doc: DocId }>()
  const { ready } = useBrandReady()
  const sections = useLiveQuery(() => (doc ? bdb.sections.where('doc').equals(doc).sortBy('order') : []), [doc], undefined)
  useEffect(() => {
    if (ready && sections?.length) {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [ready, sections])
  if (!doc || !DOCS[doc]) return <EmptyState title="Document introuvable" />
  if (!ready || !sections) return <Loading />
  const p = parsedDocs[doc]
  return (
    <div className="mx-auto max-w-[820px] bg-white px-8 py-10 text-[#111]">
      <div className="no-print mb-6 rounded-lg border border-line bg-surface-2 px-4 py-2 text-[12.5px] text-ink-2">
        La boîte d’impression s’ouvre automatiquement : choisis « Enregistrer au format PDF ».{' '}
        <button type="button" className="underline" onClick={() => window.print()}>
          Relancer l’impression
        </button>
      </div>
      <h1 className="display text-[38px] leading-tight">{p.title}</h1>
      <p className="mt-1 text-[12px] text-[#666]">Export du {new Date().toLocaleString('fr-FR')}</p>
      {p.intro && <Markdown md={p.intro} className="mt-4" />}
      {p.chapters.map((ch) => (
        <section key={ch.id} className="print-chapter mt-10">
          <h2 className="display border-b border-[#ddd] pb-2 text-[26px]">{ch.title}</h2>
          {sections
            .filter((s) => s.chapter === ch.id)
            .map((s) => (
              <article key={s.key} className="print-section mt-6">
                <div className="text-[10px] text-[#666]">
                  {s.sid} · {s.status} · {approvalLabel(s.approval)}
                  {s.approvedBy && ` — ${s.approvedBy}`}
                </div>
                <h3 className="text-[16px] font-semibold">{s.title}</h3>
                <Markdown md={s.body} className="mt-2" />
              </article>
            ))}
        </section>
      ))}
    </div>
  )
}
