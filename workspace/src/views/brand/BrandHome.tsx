import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { StatusBadge, useBrandReady } from '../../components/brand/BrandParts'
import { EmptyState, Loading, PageHeader, Section } from '../../components/ui'
import { DOCS, WORKSPACES, type DocId } from '../../lib/brand/docs'
import { plainText } from '../../lib/brand/markdown'
import { bdb } from '../../lib/brand/store'

export function useBrandSearch(q: string) {
  const sections = useLiveQuery(() => bdb.sections.toArray(), [], [])
  return useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const words = s.split(/\s+/)
    return sections
      .map((x) => {
        const text = plainText(`${x.title} ${x.body}`)
        const low = text.toLowerCase()
        if (!words.every((w) => low.includes(w))) return null
        const i = low.indexOf(words[0])
        const snippet = (i > 60 ? '…' : '') + text.slice(Math.max(0, i - 60), i + 140) + '…'
        const score = (x.title.toLowerCase().includes(s) ? 10 : 0) + words.reduce((a, w) => a + low.split(w).length - 1, 0)
        return { x, snippet, score }
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 40) as { x: (typeof sections)[number]; snippet: string; score: number }[]
  }, [sections, q])
}

export default function BrandHome() {
  const { ready, error } = useBrandReady()
  const [q, setQ] = useState('')
  const results = useBrandSearch(q)
  const stats = useLiveQuery(async () => {
    const all = await bdb.sections.toArray()
    const out = {} as Record<DocId, { total: number; approved: number; review: number; validate: number }>
    for (const d of Object.keys(DOCS) as DocId[]) {
      const l = all.filter((s) => s.doc === d)
      out[d] = { total: l.length, approved: l.filter((s) => s.approval === 'approved').length, review: l.filter((s) => s.approval === 'review').length, validate: l.filter((s) => s.status === 'À VALIDER' || /> À VALIDER/.test(s.body)).length }
    }
    return out
  }, [])
  if (error) return <Page><EmptyState title="Impossible d’ouvrir les playbooks" description={error} /></Page>
  if (!ready || !stats) return <Loading />

  return (
    <Page wide>
      <PageHeader
        eyebrow="Brand Strategy"
        title="Brand Strategy"
        description="Trois documents de référence, indépendants : la marque corporate FYNOVATES, la marque personnelle de Tiziana, et le cadre qui définit leur relation. Chaque section est éditable, versionnée, commentable et soumise à validation."
      />
      <div className="mb-10 grid gap-4 lg:grid-cols-3">
        {WORKSPACES.map((d) => {
          const st = stats[d]
          const pct = st.total ? Math.round((st.approved / st.total) * 100) : 0
          return (
            <Link key={d} to={`/brand-strategy/${d}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lg)]">
              <div className="h-1.5" style={{ background: DOCS[d].color }} />
              <div className="flex flex-1 flex-col p-5">
                <div className="eyebrow">{d === 'fn' ? 'Marque corporate' : d === 'tz' ? 'Marque personnelle' : 'Cadre commun'}</div>
                <div className="display mt-2 text-[26px] leading-tight">{DOCS[d].title.split(' — ')[0]}</div>
                <div className="text-[13px] text-ink-3">{DOCS[d].title.split(' — ')[1]}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{DOCS[d].audience}</p>
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex justify-between text-[11.5px] text-ink-3">
                    <span>
                      {st.approved} / {st.total} sections approuvées
                    </span>
                    <span>{st.validate} avec points à valider</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-[var(--v-ok)]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[12.5px] font-medium">
                    Ouvrir <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Section title="Rechercher dans les playbooks">
        <input className="input mb-4 !max-w-[520px]" placeholder="Ex. vouvoiement, posture, international, couleurs…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher dans les trois documents" />
        {q.trim().length >= 2 && results.length === 0 && <div className="text-[12.5px] text-ink-3">Aucun résultat.</div>}
        <div className="space-y-2">
          {results.map(({ x, snippet }) => (
            <Link key={x.key} to={`/brand-strategy/${x.doc}#s-${x.sid}`} className="block rounded-lg border border-line bg-surface px-4 py-3 hover:border-line-strong">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                <span className="h-2 w-[3px] rounded-full" style={{ background: DOCS[x.doc].color }} />
                {DOCS[x.doc].short} · <span className="font-mono">{x.sid}</span>
                <StatusBadge s={x.status} />
              </div>
              <div className="text-[13.5px] font-medium">{x.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-3">{snippet}</div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { to: '/brand-strategy/register', t: 'Registre d’approbation', d: 'État de validation de chaque section, valideurs et dates. Export Markdown.' },
          { to: '/brand-strategy/context', t: 'Contexte de marque (IA)', d: 'Le bon contexte selon le type de contenu : corporate, personnel, alignement. À copier ou exporter.' },
          { to: '/brand-strategy/assets', t: 'Guidelines des assets', d: 'Palette officielle, logo, typographie, inventaire des visuels et règles d’usage.' },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="card p-4 hover:shadow-[var(--shadow-lg)]">
            <div className="text-[13.5px] font-semibold">{c.t}</div>
            <p className="mt-1 text-[12.5px] text-ink-3">{c.d}</p>
          </Link>
        ))}
      </div>
    </Page>
  )
}
