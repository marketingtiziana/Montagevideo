import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Page } from '../components/AppShell'
import { Thumb, Placeholder } from '../components/images/Thumb'
import { InfographicPreview, SetupSchema, SlidesStrip, StoryStrip } from '../components/Previews'
import { PageHeader, Section } from '../components/ui'
import { useDetail } from '../lib/detail'
import { getContent, getImage } from '../lib/hooks'
import { setups } from '../lib/seed/longform'

function TemplateCard({
  name,
  format,
  structure,
  refs = [],
  warning,
  preview,
  rule,
}: {
  name: string
  format: string
  structure: string[]
  refs?: string[]
  warning?: string
  preview?: ReactNode
  rule?: string
}) {
  const { open } = useDetail()
  return (
    <div className="card flex flex-col overflow-hidden">
      {preview && <div className="border-b border-line bg-surface-2 p-4">{preview}</div>}
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[14px] font-semibold">{name}</div>
        <div className="mt-0.5 text-[12px] text-ink-3">{format}</div>
        <ul className="mt-3 space-y-1">
          {structure.map((s) => (
            <li key={s} className="flex gap-2 text-[12.5px] leading-relaxed">
              <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
              {s}
            </li>
          ))}
        </ul>
        {rule && <div className="mt-3 rounded-md bg-surface-2 px-2.5 py-1.5 text-[12px] text-ink-2">{rule}</div>}
        {warning && (
          <div className="mt-3 flex gap-1.5 text-[12px] text-ink">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
            {warning}
          </div>
        )}
        {refs.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {refs.map((id) => (
              <button key={id} type="button" onClick={() => open('i', id)} className="overflow-hidden rounded border border-line hover:border-line-strong" title={id}>
                <Thumb img={getImage(id)} className="h-12 w-12 object-top" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ImgPreview({ id, ratio = 'aspect-[4/5]', max = 'max-w-[220px]' }: { id: string; ratio?: string; max?: string }) {
  const { open } = useDetail()
  return (
    <button type="button" onClick={() => open('i', id)} className={`mx-auto block w-full ${max}`}>
      <Thumb img={getImage(id)} className={`${ratio} w-full rounded-md object-top shadow-[var(--shadow)]`} />
    </button>
  )
}

export default function Templates() {
  const info = getContent('FN-010')?.infographic
  const slides = getContent('FN-020')?.slides ?? []
  const screens = getContent('FN-005')?.screens ?? []

  return (
    <Page wide>
      <PageHeader
        eyebrow="Direction artistique"
        title="Templates"
        description="Les gabarits de chaque format, avec leur structure et leurs références. Les dispositifs vidéo décrivent ce que l’on voit à l’écran pour chaque type de tournage."
      />

      <Section title="Dispositifs de tournage — YouTube et vidéos longues">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {setups.map((s) => (
            <div key={s.id} className="card overflow-hidden">
              <SetupSchema id={s.id} className="!rounded-none !border-0 !border-b !border-line" />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-[14px] font-semibold">{s.name}</div>
                  <span className="text-[11.5px] text-ink-3">{s.duration}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">Univers {s.brand === 'TZ' ? 'Tiziana' : 'Fynovates'}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{s.description}</p>
                <div className="mt-2 text-[12px] text-ink-3">À l’écran : {s.onScreen}</div>
                <ul className="mt-2 space-y-0.5 text-[12px] text-ink-2">
                  {s.tips.map((t) => (
                    <li key={t}>— {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fynovates">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TemplateCard
            name="Infographie LinkedIn"
            format="PNG 1080 × 1350 (4:5) + PDF"
            preview={info && <InfographicPreview m={info} className="mx-auto max-w-[220px]" />}
            structure={['En-tête : wordmark + « INFOGRAPHIE · THÈME »', 'Titre fort sur 2–3 lignes', '3 à 7 blocs (arbre, flux, tableau, timeline, cascade…)', 'Encadré de synthèse bleu nuit', 'Mention : information générale, à valider par un expert']}
            refs={['IMG-001']}
          />
          <TemplateCard
            name="Carrousel PDF LinkedIn"
            format="8 pages · 1080 × 1350"
            preview={<SlidesStrip slides={slides.slice(0, 4)} size="sm" />}
            structure={['Page 1 : couverture bleu nuit, question', 'Pages intérieures blanches : une idée par page', 'Avant-dernière page : checklist / méthode', 'Dernière page : conclusion bleu nuit + signature']}
            refs={['IMG-001']}
          />
          <TemplateCard
            name="Séquence Stories pédagogique / conversion"
            format="5 écrans · 1080 × 1920"
            preview={<StoryStrip screens={screens} size="sm" />}
            structure={['Écran 1 : accroche (question, idée reçue)', 'Écran 2 : interaction (sondage, vrai/faux, quiz)', 'Écrans 3–4 : explication, parole d’expert', 'Écran 5 : « Échanger avec le cabinet » + lien']}
            rule="Alterner fonds bleu nuit et gris clair. CTA commercial uniquement sur les séquences de conversion."
            refs={['IMG-014', 'IMG-015', 'IMG-016', 'IMG-017', 'IMG-018', 'IMG-012', 'IMG-013']}
          />
          <TemplateCard
            name="Couverture vidéo TikTok / Reel"
            format="1080 × 1920 · variantes A (bleu nuit) / B (beige)"
            preview={
              <div className="flex justify-center gap-3">
                <ImgPreview id="IMG-008" ratio="aspect-[9/16]" max="max-w-[110px]" />
                <ImgPreview id="IMG-009" ratio="aspect-[9/16]" max="max-w-[110px]" />
              </div>
            }
            structure={['Wordmark + numéro « N° 01 »', 'Rubrique en capitales (FISCALITÉ, BANQUE…)', 'Titre XXL ferré à gauche', 'Un seul mot-clé en lavande ou surligné', 'Baseline en pied de page']}
            refs={['IMG-008', 'IMG-009', 'IMG-007']}
          />
          <TemplateCard
            name="Publication Instagram"
            format="1080 × 1350"
            preview={
              <div className="flex justify-center gap-3">
                <ImgPreview id="IMG-004" max="max-w-[120px]" />
                <ImgPreview id="IMG-005" max="max-w-[120px]" />
                <ImgPreview id="IMG-006" max="max-w-[120px]" />
              </div>
            }
            structure={['Photo (désaturée) + titre sur blanc', 'ou couverture bleu nuit sur photo teintée', 'ou couverture de carrousel « Guide · Fiscalité » 1/6']}
            refs={['IMG-004', 'IMG-005', 'IMG-006', 'IMG-003']}
          />
          <TemplateCard
            name="Stories à la une"
            format="Couvertures rondes, fond bleu nuit"
            preview={<ImgPreview id="IMG-019" ratio="aspect-[5/1]" max="max-w-full" />}
            structure={['BANQUE · CONTACT · ÉQUIPE · FISCALITÉ', 'INTERNATIONAL · LE CABINET · MÉTHODE · TVA', 'Texte en capitales espacées, sans icône']}
            refs={['IMG-019']}
          />
          <TemplateCard
            name="Bannière / identité"
            format="2560 × 1440"
            preview={<ImgPreview id="IMG-010" ratio="aspect-video" max="max-w-full" />}
            structure={['Wordmark pur centré', 'Baseline « Conseil fiscal & structuration internationale »', 'Fond bleu nuit']}
            refs={['IMG-010']}
          />
          <TemplateCard
            name="Miniature YouTube"
            format="1280 × 720"
            preview={<ImgPreview id="IMG-011" ratio="aspect-video" max="max-w-full" />}
            structure={['Titre 2 lignes à gauche, capitales', 'Sous-titre court', 'Portrait à droite, décor lié au sujet']}
            warning="La référence fournie contient un monogramme F : à retirer (interdit par la charte). Identité de la personne à confirmer."
            refs={['IMG-011']}
          />
        </div>
      </Section>

      <Section title="Tiziana / Madame Caci">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TemplateCard
            name="Feed Instagram 3 × 3"
            format="Photographies 1080 × 1350"
            preview={
              <div className="mx-auto grid max-w-[220px] grid-cols-3 gap-[2px]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Placeholder key={i} label="PHOTO" className="aspect-[4/5]" />
                ))}
              </div>
            }
            structure={['Photographies uniquement', 'Alterner portraits, architecture, environnements de travail, déplacements', 'Carrousels exclusivement photographiques']}
            rule="Aucun texte incrusté, aucun montage, aucun logo Fynovates. Les emplacements restent vides tant que les photos réelles ne sont pas fournies."
            refs={['IMG-002']}
          />
          <TemplateCard
            name="Story — bandeaux blancs"
            format="1080 × 1920 · typographie native Instagram"
            preview={
              <div className="mx-auto flex aspect-[9/16] max-w-[130px] flex-col justify-start gap-0 rounded-[12px] bg-[#333F5A] p-3 pt-8">
                <span className="text-[9px] leading-[1.75] text-[#111]" style={{ fontFamily: 'Georgia, serif' }}>
                  <span className="bg-white px-1 [box-decoration-break:clone]">Une structure doit servir un projet, pas l’inverse.</span>
                </span>
              </div>
            }
            structure={['Photo personnelle ou de lieu en fond', 'Texte sérif noir sur bandeaux blancs', 'ou texte sans-sérif noir/blanc directement sur la photo', 'Stickers natifs : sondage, question']}
            refs={['IMG-021', 'IMG-022', 'IMG-023', 'IMG-024']}
            rule="Les références sont des captures de comptes tiers : inspiration du code, pas des visuels à reprendre."
          />
          <TemplateCard
            name="Reel face caméra"
            format="9:16 · 30–90 s"
            preview={<ImgPreview id="IMG-002" ratio="aspect-[4/3]" max="max-w-full" />}
            structure={['Accroche parlée dans les 2 premières secondes', 'Sous-titres natifs blancs centrés', 'Décors réels : bureau, terrasse, déplacements', 'Extraits possibles des décryptages YouTube']}
            refs={['IMG-002']}
          />
          <TemplateCard
            name="Post LinkedIn Tiziana"
            format="Texte à la première personne + photo optionnelle"
            structure={['Première ligne : conviction ou constat', 'Développement court, aéré', 'Une expression signature en conclusion', 'Photo réelle ou aucun visuel']}
            rule="Séries : Le point de vue de Tiziana · Ce que les entrepreneurs ne comprennent pas · Construire Fynovates · Ce que je constate sur le terrain · Ma vision de l’entrepreneuriat international."
          />
        </div>
      </Section>
    </Page>
  )
}
