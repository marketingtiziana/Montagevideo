import { useState } from 'react'
import { Page } from '../components/AppShell'
import { LongFormCard } from '../components/Cards'
import { SetupSchema } from '../components/Previews'
import { PageHeader, Section, Tabs } from '../components/ui'
import { setups, longforms, type SetupId } from '../lib/seed/longform'

export default function LongForms() {
  const [setup, setSetup] = useState<SetupId | 'all'>('all')
  const list = longforms.filter((l) => setup === 'all' || l.setup === setup)
  return (
    <Page wide>
      <PageHeader
        eyebrow="Idées de contenus"
        title="Long formats YouTube"
        description="Des sujets concrets, prêts à tourner. Chaque idée précise le dispositif (iPad + facecam, télévision, débunkage, motion design, expert), l’accroche, les chapitres, ce qu’on montre à l’écran et les déclinaisons courtes. Ce sont des propositions : à valider, et à faire relire par un expert dès qu’elles contiennent de la fiscalité."
      />
      <Section title="Les dispositifs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {setups.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSetup(setup === s.id ? 'all' : s.id)}
              className={`overflow-hidden rounded-xl border bg-surface text-left transition-shadow hover:shadow-[var(--shadow)] ${setup === s.id ? 'border-ink ring-2 ring-ink/10' : 'border-line'}`}
            >
              <SetupSchema id={s.id} className="!rounded-none !border-0" />
              <div className="px-3 py-2">
                <div className="text-[12.5px] font-semibold">{s.short}</div>
                <div className="text-[11px] text-ink-3">
                  {s.brand === 'TZ' ? 'Tiziana' : 'Fynovates'} · {longforms.filter((l) => l.setup === s.id).length} idées
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>
      <Tabs
        className="mb-4"
        value={setup}
        onChange={setSetup}
        items={[{ value: 'all' as const, label: 'Toutes', count: longforms.length }, ...setups.map((s) => ({ value: s.id, label: s.short, count: longforms.filter((l) => l.setup === s.id).length }))]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((l) => (
          <LongFormCard key={l.id} l={l} />
        ))}
      </div>
      <p className="mt-6 text-[12px] text-ink-3">
        Rythme prévu : validation du sujet et du support le mardi, tournage dans la semaine, montage du long format et des shorts, validation commune avant la vidéo suivante. Objectif minimum : un long format par semaine.
      </p>
    </Page>
  )
}
