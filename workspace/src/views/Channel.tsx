import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { IdeaCard, ImageTile, LongFormCard } from '../components/Cards'
import { Placeholder } from '../components/images/Thumb'
import { EmptyState, PageHeader, Section } from '../components/ui'
import { BRANDS, PLATFORMS } from '../lib/constants'
import { useChannels, useContents, useImages } from '../lib/hooks'
import { longforms } from '../lib/seed/longform'
import type { PlatformId } from '../lib/types'
import { SectionList } from './Brand'
import { CtaBadge } from '../components/CtaBits'
import { ctaByPlatform } from '../lib/seed/cta'
import { rhythms } from '../lib/seed/rhythm'
import { platformDesign } from '../lib/seed/design'
import { getImage } from '../lib/hooks'
import { useDetail } from '../lib/detail'
import { Thumb } from '../components/images/Thumb'
import { AlertTriangle } from 'lucide-react'
import { ValidationBadge } from '../components/ui'
import { inspirationFor } from '../lib/seed/postStructures'

export default function Channel() {
  const { id } = useParams<{ id: PlatformId }>()
  const ch = useChannels().find((c) => c.id === id)
  const contents = useContents()
  const images = useImages()
  if (!ch || !id) return <Page><EmptyState title="Plateforme introuvable" /></Page>
  const p = PLATFORMS[id]
  const ideas = contents.filter((c) => c.platforms.includes(id))
  const refs = images.filter((i) => i.platform === id)

  return (
    <Page wide>
      <PageHeader eyebrow={`${p.network} · ${BRANDS[p.brand].label}`} title={ch.name} description={ch.role} />
      <div className="-mt-2 mb-8 flex flex-wrap gap-2">
        {rhythms
          .filter((r) => r.platform === id)
          .map((r) => (
            <Link key={r.id} to="/rhythm" className="rounded-lg border border-line bg-surface px-3 py-2 hover:border-line-strong">
              <div className="text-[11px] text-ink-3">{r.label}</div>
              <div className="text-[14px] font-semibold">{r.frequency}</div>
            </Link>
          ))}
      </div>
      <AccountDesign id={id} />
      {id === 'ig-tz' && (
        <Section title="Feed 3 × 3">
          <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
            <div className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-lg border border-line bg-line">
              {Array.from({ length: 9 }).map((_, i) => (
                <Placeholder key={i} label="PHOTO RÉELLE" className="aspect-[4/5]" />
              ))}
            </div>
            <div className="space-y-2 text-[13px] leading-relaxed text-ink-2">
              <p>Le feed de Tiziana ne contient que des photographies réelles : aucun texte incrusté, aucun montage, aucun logo Fynovates, aucune infographie.</p>
              <p className="text-ink-3">Les photos individuelles n’ont pas été fournies : la proposition de feed complète est visible sur la planche IMG-002.</p>
            </div>
          </div>
        </Section>
      )}
      <Section title="Stratégie">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ch.sections.map((s) => (
            <SectionList key={s.id} s={s} />
          ))}
        </div>
      </Section>
      <Inspiration id={id} />
      <Section title="Stratégie CTA" aside={<Link to="/journeys" className="text-[12px] text-ink-3 hover:text-ink">Parcours & CTA →</Link>}>
        <div className="divide-y divide-line rounded-xl border border-line bg-surface">
          {ctaByPlatform[id].map((r) => (
            <div key={r.content} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
              <span className="min-w-[220px] flex-1 text-[13px]">{r.content}</span>
              {r.note && <span className="text-[12px] text-ink-3">{r.note}</span>}
              <CtaBadge id={r.cta} />
            </div>
          ))}
        </div>
      </Section>
      {id === 'yt-fn' && (
        <Section title="Idées de long formats" aside={<Link to="/longform" className="text-[12px] text-ink-3 hover:text-ink">Toutes les idées →</Link>}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {longforms.slice(0, 6).map((l) => (
              <LongFormCard key={l.id} l={l} />
            ))}
          </div>
        </Section>
      )}
      <Section title={`${id === "yt-fn" ? "Idées de vidéos" : "Idées de posts"} (${ideas.length})`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ideas.map((c) => (
            <IdeaCard key={c.id} c={c} platform={id} />
          ))}
        </div>
      </Section>
      {refs.length > 0 && (
        <Section title="Références visuelles">
          <div className="columns-2 gap-4 md:columns-3 xl:columns-5">
            {refs.map((i) => (
              <ImageTile key={i.id} img={i} natural />
            ))}
          </div>
        </Section>
      )}
    </Page>
  )
}

function Inspiration({ id }: { id: PlatformId }) {
  const insp = inspirationFor(id)
  const { open } = useDetail()
  if (!insp) return null
  const shot = (iid: string, cls = 'max-h-[300px]') => (
    <button key={iid} type="button" onClick={() => open('i', iid)} className="block overflow-hidden rounded-md border border-line bg-surface-2" aria-label={`Agrandir ${iid}`}>
      <Thumb img={getImage(iid)} fit="contain" className={`w-full ${cls}`} />
    </button>
  )
  return (
    <Section title={insp.title ?? "Compte d’inspiration & structures de posts"}>
      <div className="mb-4 flex gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-ink-2">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
        Captures de comptes tiers : inspiration interne uniquement. On reprend les structures, jamais les textes, les chiffres ni les visuels.
      </div>
      {!insp.profileImageId && (
        <p className="mb-4 text-[13px] leading-relaxed text-ink-2">
          <span className="eyebrow mr-2">{insp.label}</span>
          {insp.why}
        </p>
      )}
      {insp.profileImageId && <div className="card mb-4 grid gap-4 p-4 md:grid-cols-[220px_1fr]">
        {shot(insp.profileImageId, 'max-h-[340px]')}
        <div>
          <div className="eyebrow">{insp.label}</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{insp.why}</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-[13px] font-semibold">Anatomie du profil</h3>
              <ul className="mt-1.5 space-y-1">{insp.profile?.map((x) => <li key={x} className="text-[12.5px] leading-relaxed">— {x}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold">Pour Tiziana</h3>
              <ul className="mt-1.5 space-y-1">{insp.profileAdaptation?.map((x) => <li key={x} className="text-[12.5px] leading-relaxed">— {x}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {insp.structures.map((st, n) => (
          <article key={st.id} className="card grid gap-4 p-4 sm:grid-cols-[160px_1fr]" data-structure={st.id}>
            <div className="space-y-2">{st.imageIds.map((iid) => shot(iid, 'max-h-[260px]'))}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[14px] font-semibold">
                  <span className="tabular mr-1.5 text-ink-3">{String(n + 1).padStart(2, '0')}</span>
                  {st.name}
                </h3>
                <ValidationBadge value={st.validation} />
              </div>
              <p className="mt-1 text-[12px] text-ink-3">Quand : {st.when}</p>
              <ol className="mt-2.5 space-y-1">
                {st.steps.map((x, i) => (
                  <li key={x} className="flex gap-2 text-[12.5px] leading-relaxed">
                    <span className="tabular w-4 shrink-0 text-ink-3">{i + 1}.</span>
                    {x}
                  </li>
                ))}
              </ol>
              <div className="mt-3 rounded-md bg-surface-2 p-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Adaptation Tiziana</div>
                <ul className="mt-1 space-y-1">{st.adaptation.map((x) => <li key={x} className="text-[12.5px] leading-relaxed">{x}</li>)}</ul>
              </div>
              {st.warning && (
                <div className="mt-2.5 flex gap-1.5 text-[12px]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
                  {st.warning}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function AccountDesign({ id }: { id: PlatformId }) {
  const blocks = platformDesign[id]
  const { open } = useDetail()
  if (!blocks.length)
    return (
      <Section title="Design du compte">
        <div className="rounded-xl border border-dashed border-line-strong px-4 py-5 text-[12.5px] text-ink-3">Aucun visuel de design fourni pour ce compte.</div>
      </Section>
    )
  return (
    <Section title="Design du compte">
      <div className="grid gap-4 lg:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.title} className={`card overflow-hidden ${b.wide ? 'lg:col-span-2' : ''}`}>
            {b.imageIds.length > 0 && <div className="grid gap-2 bg-surface-2 p-3" style={b.imageIds.length > 1 ? { gridTemplateColumns: `repeat(${Math.min(b.imageIds.length, 3)}, minmax(0, 1fr))` } : undefined}>
              {b.imageIds.map((iid) => (
                <button key={iid} type="button" onClick={() => open('i', iid)} className="block overflow-hidden rounded-md" aria-label={`Agrandir ${iid}`}>
                  <Thumb img={getImage(iid)} fit={b.crop ? 'cover' : 'contain'} label="VISUEL À IMPORTER" className={b.crop ?? `w-full ${b.wide ? 'max-h-[420px]' : 'max-h-[320px]'} ${getImage(iid)?.src ? '' : 'aspect-video'}`} />
                </button>
              ))}
            </div>}
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[14px] font-semibold">{b.title}</h3>
                <span className="font-mono text-[10.5px] text-ink-3">{b.imageIds.join(' · ')}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {b.specs.map((x) => (
                  <li key={x} className="flex gap-2 text-[12.5px] leading-relaxed">
                    <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                    {x}
                  </li>
                ))}
              </ul>
              {b.warning && (
                <div className="mt-3 flex gap-1.5 text-[12px]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
                  {b.warning}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
