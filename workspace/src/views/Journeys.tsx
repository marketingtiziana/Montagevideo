import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { Page } from '../components/AppShell'
import { PageHeader, Section } from '../components/ui'
import { PLATFORMS } from '../lib/constants'
import { useJourneys, useRules } from '../lib/hooks'

export default function Journeys() {
  const journeys = useJourneys()
  const rules = useRules().filter((r) => r.scope === 'Conversion')
  return (
    <Page>
      <PageHeader
        eyebrow="Stratégie"
        title="Parcours de conversion"
        description="Trois parcours, chacun avec son rôle. Le CTA d’un contenu dépend du parcours qu’il alimente."
      />
      {journeys.map((j) => (
        <Section key={j.id} title={j.name}>
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
        </Section>
      ))}
      <Section title="Règles">
        <ul className="space-y-2">
          {rules.map((r) => (
            <li key={r.id} className="flex gap-2.5 text-[13.5px]">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
              {r.text}
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  )
}
