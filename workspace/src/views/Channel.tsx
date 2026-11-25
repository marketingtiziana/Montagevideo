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
