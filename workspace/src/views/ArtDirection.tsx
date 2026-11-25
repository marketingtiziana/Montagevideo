import { Link } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { Thumb } from '../components/images/Thumb'
import { Loading, PageHeader, Section } from '../components/ui'
import { BRANDS, modelFor } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useBrands, useContents, useImages } from '../lib/hooks'

const MODELS = [
  { key: 'A', title: 'Infographie', to: '/infographics', model: 'infographic', text: 'Structure, titre, 3 à 5 blocs d’information, hiérarchie des données, composition et emplacement de référence.' },
  { key: 'B', title: 'Carrousel', to: '/carousels', model: 'carousel', text: 'Chaque slide en miniature : numéro, titre, message, contenu, fonction narrative, composition, référence.' },
  { key: 'C', title: 'Storyboard Reel', to: '/storyboards', model: 'storyboard', text: 'Timeline verticale : durée, image, texte ou dialogue, caméra, voix off, transition, objectif narratif.' },
  { key: 'D', title: 'Story Instagram', to: '/stories', model: 'story', text: 'Écrans 9:16 en séquence : visuel, texte, typographie, position, interaction, CTA.' },
  { key: 'E', title: 'Feed Tiziana', to: '/channel/ig-tz', model: null, text: 'Grille photographique 3 × 3 alimentée uniquement par les photos réelles importées.' },
] as const

export default function ArtDirection() {
  const brands = useBrands()
  const images = useImages()
  const contents = useContents()
  const { open } = useDetail()
  if (!brands || !images || !contents) return <Loading />
  return (
    <Page wide>
      <PageHeader
        eyebrow="Creative Studio"
        title="Art Direction"
        description="Visualiser chaque contenu avant sa production. Les propositions créatives sont toujours identifiées comme telles et ne se confondent pas avec les décisions validées."
      />
      <Section title="Modèles de propositions visuelles">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-5">
          {MODELS.map((m) => {
            const n = m.model ? contents.filter((c) => modelFor(c.format) === m.model).length : images.filter((i) => i.type === 'photo-tiziana').length
            return (
              <Link key={m.key} to={m.to} className="bg-surface p-4 hover:bg-surface-2">
                <div className="flex items-baseline gap-2">
                  <span className="display text-[28px] leading-none text-ink-3">{m.key}</span>
                  <span className="text-[13.5px] font-semibold">{m.title}</span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-3">{m.text}</p>
                <div className="mt-3 text-[11.5px] tabular text-ink-2">{n} {m.model ? 'contenu(s)' : 'photo(s) réelle(s)'}</div>
              </Link>
            )
          })}
        </div>
      </Section>
      <div className="grid gap-10 xl:grid-cols-2">
        {brands.map((b) => {
          const da = b.sections.filter((s) => /direction|interdiction|signature/i.test(s.title))
          const refs = images.filter((i) => i.brand === b.id)
          return (
            <div key={b.id}>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full" style={{ background: BRANDS[b.id].color }} />
                <h2 className="display text-[30px] leading-none">{b.name}</h2>
              </div>
              <div className="mb-5 space-y-4">
                {da.map((s) => (
                  <div key={s.id}>
                    <div className="eyebrow mb-1.5">{s.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.items.map((it) => (
                        <span
                          key={it.id}
                          className={`rounded-md border px-2 py-1 text-[12px] ${s.kind === 'rules' ? 'border-[color-mix(in_srgb,var(--v-expert)_30%,var(--line))] text-ink' : 'border-line bg-surface text-ink-2'}`}
                        >
                          {it.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="eyebrow mb-2">Références ({refs.length})</div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {refs.map((i) => (
                  <button key={i.id} type="button" onClick={() => open('i', i.id)} className="overflow-hidden rounded-lg border border-line bg-surface text-left hover:border-line-strong">
                    <Thumb img={i} className="aspect-square w-full object-top" />
                    <div className="px-2 py-1 font-mono text-[10.5px] text-ink-3">{i.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-10 border-t border-line pt-4 text-[12px] text-ink-3">
        La direction artistique de cet espace de travail est volontairement neutre : elle ne doit pas être confondue avec celle de Fynovates ou de Tiziana.
      </p>
    </Page>
  )
}
