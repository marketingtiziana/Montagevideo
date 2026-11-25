import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { LongFormCard } from '../components/Cards'
import { PageHeader, Section } from '../components/ui'
import { BRANDS, PLATFORMS } from '../lib/constants'
import { useBrands, useChannels } from '../lib/hooks'
import { charters } from '../lib/seed/da'
import { longforms } from '../lib/seed/longform'
import { rhythms } from '../lib/seed/rhythm'

const ENTRIES = [
  { to: '/brand/FN', title: 'Les deux marques', text: 'Positionnement, valeurs, ton et expressions signatures.' },
  { to: '/da/FN', title: 'Direction artistique', text: 'Codes couleur, typographies, codes graphiques, interdits.' },
  { to: '/templates', title: 'Templates', text: 'Infographie, carrousel, Stories, couvertures, formats vidéo.' },
  { to: '/longform', title: 'Idées de long formats', text: 'Sujets YouTube prêts à tourner : iPad + facecam, télévision, motion…' },
  { to: '/ideas', title: 'Idées par plateforme', text: 'Posts, Reels, Stories, carrousels pour chaque compte.' },
  { to: '/journeys', title: 'Parcours & CTA', text: 'Quel CTA utiliser, sur quelle plateforme, pour quel contenu.' },
]

export default function Overview() {
  const brands = useBrands()
  const channels = useChannels()
  return (
    <Page>
      <PageHeader
        eyebrow="Fynovates × Tiziana / Madame Caci"
        title="Guide stratégique & créatif"
        description="La référence commune pour produire les contenus des deux marques : ce que chaque marque raconte, à quoi ressemblent ses visuels, ce que chaque plateforme publie, et des idées de posts concrètes, prêtes à tourner."
      />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Link key={b.id} to={`/brand/${b.id}`} className="card group block overflow-hidden transition-shadow hover:shadow-[var(--shadow-lg)]">
            <div className="flex h-2">
              {charters[b.id].palette.map((s) => (
                <span key={s.hex} className="flex-1" style={{ background: s.hex }} />
              ))}
            </div>
            <div className="p-5">
              <span className="eyebrow">{b.id === 'FN' ? 'Le cabinet' : 'La dirigeante'}</span>
              <div className="display mt-2 text-[30px] leading-none">{b.name}</div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{b.positioning}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {channels
                  .filter((c) => c.brand === b.id)
                  .map((c) => (
                    <span key={c.id} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-2">
                      {PLATFORMS[c.id].label}
                    </span>
                  ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Section title="Par où commencer">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ENTRIES.map((e) => (
            <Link key={e.to} to={e.to} className="group bg-surface p-4 hover:bg-surface-2">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                {e.title}
                <ArrowRight size={13} className="ml-auto text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{e.text}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Ce que chaque plateforme publie">
        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((ch) => (
            <Link key={ch.id} to={`/channel/${ch.id}`} className="flex gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: PLATFORMS[ch.id].color }} />
              <div>
                <div className="flex items-center gap-2 text-[13px] font-medium">
                  {ch.name}
                  <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[ch.brand].color }} />
                </div>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">{ch.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Rythme de publication" aside={<Link to="/rhythm" className="text-[12px] text-ink-3 hover:text-ink">Semaine type →</Link>}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {rhythms
            .filter((r) => r.perWeek[1] > 0)
            .map((r) => (
              <Link key={r.id} to="/rhythm" className="rounded-xl border border-line bg-surface p-3 hover:border-line-strong">
                <div className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLATFORMS[r.platform].color }} />
                  {r.label}
                </div>
                <div className="mt-1 text-[16px] font-semibold">{r.frequency}</div>
              </Link>
            ))}
        </div>
      </Section>

      <Section
        title="Long formats à tourner"
        aside={
          <Link to="/longform" className="text-[12px] text-ink-3 hover:text-ink">
            Voir les {longforms.length} idées →
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {longforms.slice(0, 3).map((l) => (
            <LongFormCard key={l.id} l={l} />
          ))}
        </div>
      </Section>
    </Page>
  )
}
