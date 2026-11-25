import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { Loading, PageHeader, Section, ValidationBadge } from '../components/ui'
import { BRANDS, PILLAR_IDS, PILLARS, PLATFORM_IDS, PLATFORMS, STAGES } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { isToClassify, useBrands, useChannels, useContents, useImages, useProblems, useRules } from '../lib/hooks'

const STEPS = [
  { n: '1', title: 'Comprendre les deux marques', to: '/brands', text: 'Le cabinet Fynovates et la dirigeante Tiziana : positionnement, ton, direction artistique, interdits.' },
  { n: '2', title: 'Lire les problématiques prospects', to: '/insights', text: 'Six piliers, chaque problématique avec sa situation concrète et ses angles.' },
  { n: '3', title: 'Voir ce que chaque plateforme publie', to: '/channel/ig-tz', text: 'Rôle, formats, règles non négociables et contenus par canal.' },
  { n: '4', title: 'Décliner un sujet', to: '/matrix', text: 'La matrice transforme une problématique en contenus adaptés à chaque plateforme.' },
  { n: '5', title: 'Visualiser avant de produire', to: '/art-direction', text: 'Références visuelles, modèles d’infographie, carrousel, storyboard et Story.' },
  { n: '6', title: 'Suivre la production', to: '/board', text: 'De l’idée à la publication, avec la validation technique au milieu.' },
]

export default function Overview() {
  const contents = useContents()
  const problems = useProblems()
  const images = useImages()
  const channels = useChannels()
  const brands = useBrands()
  const rules = useRules()
  const { open } = useDetail()
  if (!contents || !problems || !images || !channels || !brands || !rules) return <Loading />

  const expert = contents.filter((c) => c.techValidation === 'requise' || c.validation === 'VALIDATION EXPERT REQUISE')
  const warnings = images.filter((i) => i.warnings.some((w) => /non conforme|seules|aucun témoignage/i.test(w)))
  const toClassify = images.filter(isToClassify)

  return (
    <Page>
      <PageHeader
        eyebrow="Fynovates × Tiziana / Madame Caci"
        title="Strategic Overview"
        description="L’espace de pilotage de la stratégie marketing, éditoriale, commerciale et artistique des deux marques. Tout est relié : une problématique prospect mène à un pilier, une marque, une plateforme, un contenu, un visuel et un parcours de conversion."
      />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Link key={b.id} to="/brands" className="card group block p-5 transition-shadow hover:shadow-[var(--shadow-lg)]">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-5 w-[3px] rounded-full" style={{ background: BRANDS[b.id].color }} />
              <span className="eyebrow">{b.id === 'FN' ? 'Le cabinet' : 'La dirigeante'}</span>
            </div>
            <div className="display text-[28px] leading-none">{b.name}</div>
            <div className="mt-1 text-[12.5px] text-ink-3">{b.descriptor}</div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{b.positioning}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {PLATFORM_IDS.filter((p) => PLATFORMS[p].brand === b.id).map((p) => (
                <span key={p} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-2">
                  {PLATFORMS[p].label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <Section title="Prendre en main l’espace en six étapes">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <Link key={s.n} to={s.to} className="group bg-surface p-4 hover:bg-surface-2">
              <div className="flex items-baseline gap-3">
                <span className="display text-[26px] leading-none text-ink-3">{s.n}</span>
                <span className="text-[13.5px] font-semibold">{s.title}</span>
                <ArrowRight size={13} className="ml-auto text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{s.text}</p>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <Section title="Ce que chaque plateforme doit publier">
          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {channels.map((ch) => (
              <Link key={ch.id} to={`/channel/${ch.id}`} className="flex gap-4 px-4 py-3 hover:bg-surface-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: PLATFORMS[ch.id].color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">{ch.name}</span>
                    <span className="text-[11.5px] tabular text-ink-3">{contents.filter((c) => c.platforms.includes(ch.id)).length} contenus</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">{ch.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
        <div>
          <Section title="Problématiques par pilier">
            <div className="space-y-1.5">
              {PILLAR_IDS.map((p) => {
                const n = problems.filter((x) => x.pillar === p).length
                const nc = contents.filter((c) => c.pillar === p).length
                return (
                  <Link key={p} to={`/pillars#${p}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ background: PILLARS[p].color }}>
                      {p}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px]">{PILLARS[p].label}</span>
                    <span className="shrink-0 text-[11.5px] tabular text-ink-3">
                      {n} · {nc}
                    </span>
                  </Link>
                )
              })}
              <div className="px-2 pt-1 text-[11px] text-ink-3">problématiques · contenus</div>
            </div>
          </Section>
          <Section title="Production">
            <div className="flex h-2 overflow-hidden rounded-full bg-surface-3">
              {STAGES.map((s, i) => {
                const n = contents.filter((c) => c.status === s.id).length
                return n ? (
                  <div key={s.id} title={`${s.label} : ${n}`} style={{ width: `${(n / contents.length) * 100}%`, background: `color-mix(in srgb, var(--ink) ${20 + i * 10}%, transparent)` }} />
                ) : null
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {STAGES.map((s) => (
                <Link key={s.id} to="/board" className="flex justify-between text-[12px] text-ink-2 hover:text-ink">
                  <span>{s.label}</span>
                  <span className="tabular text-ink-3">{contents.filter((c) => c.status === s.id).length}</span>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <Section title="Points d’attention">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-4">
            <div className="text-[12px] font-semibold">Validation technique</div>
            <div className="display mt-1 text-[30px] leading-none">{expert.length}</div>
            <p className="mt-1 text-[12px] text-ink-3">contenus contiennent des informations fiscales ou réglementaires à faire valider par un expert.</p>
            <Link to="/database" className="mt-2 inline-block text-[12px] font-medium underline-offset-2 hover:underline">
              Voir la base →
            </Link>
          </div>
          <div className="card p-4">
            <div className="text-[12px] font-semibold">Visuels non conformes ou à arbitrer</div>
            <div className="mt-2 space-y-1.5">
              {warnings.map((i) => (
                <button key={i.id} type="button" onClick={() => open('i', i.id)} className="block text-left text-[12px] text-ink-2 hover:text-ink">
                  <span className="font-mono text-ink-3">{i.id}</span> — {i.warnings[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-[12px] font-semibold">Visuels à classer</div>
            <div className="display mt-1 text-[30px] leading-none">{toClassify.length}</div>
            <p className="mt-1 text-[12px] text-ink-3">images sans destination confirmée (captures de comptes tiers, imports récents).</p>
            <Link to="/references" className="mt-2 inline-block text-[12px] font-medium underline-offset-2 hover:underline">
              Classer →
            </Link>
          </div>
        </div>
      </Section>

      <Section title="Règles de fidélité stratégique">
        <div className="grid gap-2 md:grid-cols-2">
          {rules.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg border border-line bg-surface px-3 py-2.5">
              <span className="eyebrow mt-0.5 w-[70px] shrink-0">{r.scope}</span>
              <span className="flex-1 text-[12.5px] leading-relaxed">{r.text}</span>
              <ValidationBadge value={r.validation} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
