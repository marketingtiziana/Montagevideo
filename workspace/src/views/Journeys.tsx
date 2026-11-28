import { ArrowRight, Ban } from 'lucide-react'
import { Fragment, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { CtaBadge } from '../components/CtaBits'
import { PageHeader, Section, ValidationBadge } from '../components/ui'
import { PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useContents, useJourneys } from '../lib/hooks'
import { ctaByPlatform, ctaOf, ctas, ctaStop } from '../lib/seed/cta'

export default function Journeys() {
  const journeys = useJourneys()
  const contents = useContents()
  const { open } = useDetail()
  const loc = useLocation()
  useEffect(() => {
    if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loc.hash])

  return (
    <Page wide>
      <PageHeader
        eyebrow="Stratégie"
        title="Parcours & CTA"
        description="Trois parcours de conversion, et le CTA qui correspond à chaque type de contenu. Règle de base : pas de CTA commercial partout. La plupart des contenus renvoient vers une vidéo YouTube ; seules les Stories de conversion demandent un contact."
      />

      {journeys.map((j) => {
        const jctas = ctas.filter((c) => c.journey === j.id)
        return (
          <Section key={j.id} title={`Parcours ${j.name}`}>
            <p className="mb-4 text-[13px] text-ink-2">{j.summary}</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
              {j.steps.map((s, i) => (
                <Fragment key={s.id}>
                  <div className="card flex-1 p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="display text-[24px] leading-none text-ink-3">{i + 1}</span>
                      <span className="text-[14px] font-semibold">{s.label}</span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{s.detail}</p>
                    {s.platform && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-3">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLATFORMS[s.platform].color }} />
                        {PLATFORMS[s.platform].label}
                      </div>
                    )}
                  </div>
                  {i < j.steps.length - 1 && <ArrowRight size={16} className="mx-auto shrink-0 rotate-90 self-center text-ink-3 md:rotate-0" />}
                </Fragment>
              ))}
            </div>
            {jctas.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
                CTA de ce parcours :
                {jctas.map((c) => (
                  <CtaBadge key={c.id} id={c.id} />
                ))}
              </div>
            )}
          </Section>
        )
      })}

      <Section title="Les CTA">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ctas.map((c) => {
            const examples = contents.filter((x) => ctaOf(x) === c.id && x.cta).slice(0, 4)
            return (
              <div key={c.id} id={`cta-${c.id}`} className="card flex scroll-mt-6 flex-col p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <CtaBadge id={c.id} link={false} />
                  <ValidationBadge value={c.validation} />
                </div>
                <div className="space-y-1">
                  {c.wordings.map((w) => (
                    <div key={w} className="rounded-md bg-surface-2 px-2.5 py-1.5 text-[13px] font-medium">« {w} »</div>
                  ))}
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-2">{c.how}</p>
                <div className="mt-3">
                  <div className="eyebrow mb-1">Où l’utiliser</div>
                  <ul className="space-y-0.5 text-[12.5px]">
                    {c.where.map((w) => (
                      <li key={w}>— {w}</li>
                    ))}
                  </ul>
                </div>
                {c.avoid !== '—' && <p className="mt-3 text-[12px] text-ink-3">{c.avoid}</p>}
                {examples.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1 pt-3">
                    {examples.map((x) => (
                      <button key={x.id} type="button" onClick={() => open('c', x.id)} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3 hover:border-line-strong hover:text-ink" title={x.subject}>
                        {x.id}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-[10.5px] text-ink-3">Source : {c.source}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Quel CTA sur quelle plateforme">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLATFORM_IDS.map((p) => (
            <div key={p} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold">
                <span className="h-2 w-2 rounded-full" style={{ background: PLATFORMS[p].color }} />
                {PLATFORMS[p].label}
              </div>
              <div className="space-y-2">
                {ctaByPlatform[p].map((r) => (
                  <div key={r.content} className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
                    <span className="text-ink-2">{r.content}</span>
                    <CtaBadge id={r.cta} />
                    {r.note && <span className="w-full text-[11.5px] text-ink-3">{r.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ce qu’on arrête">
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--v-expert)_28%,var(--line))] bg-surface p-4">
          <ul className="space-y-1.5">
            {ctaStop.map((s) => (
              <li key={s} className="flex gap-2 text-[13px]">
                <Ban size={14} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-3">Raison : ils attirent des prospects insuffisamment qualifiés.</p>
        </div>
      </Section>
    </Page>
  )
}
