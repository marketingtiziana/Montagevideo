import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { useIdentity } from '../../components/brand/BrandParts'
import { PageHeader, Section, Tabs } from '../../components/ui'
import { YT_DEFAULTS, YT_SECTIONS, YT_SHORTS, YT_TO_VALIDATE, YT_VIDEOS, YT_WELCOME, type YtTexts, type YtVideo } from '../../lib/seed/youtubeFn'
import { AssetCard, DeviceSwitch, FitWidth, NAVY, Scaled, TextsEditor, ToValidate, useDevice, useEditableTexts, type Device, type TextGroup } from './kit'
import { YT_AVATAR, YT_BANNER, YT_SHORT, YT_THUMB, YtAvatar, YtBanner, YtEndScreen, YtShortThumb, YtThumb } from './youtubeVisuals'

const WIDTH: Record<Device, number> = { desktop: 1284, tablet: 820, mobile: 390 }
const video = (id: string) => (YT_VIDEOS.find((v) => v.id === id) ?? YT_WELCOME) as YtVideo
const formatOf = (v: YtVideo) => (v.style === 'photo' ? 'Format A · Tiziana' : 'Format B · Pédagogie')

const GROUPS: TextGroup[] = [
  {
    title: 'En-tête de la chaîne',
    fields: [
      { path: 'name', label: 'Nom' },
      { path: 'handle', label: 'Identifiant', hint: 'à renseigner' },
      { path: 'website', label: 'Lien affiché' },
      { path: 'banner.message', label: 'Bannière — phrase de positionnement', rows: 2 },
      { path: 'banner.domains', label: 'Bannière — domaines (séparés par •)' },
    ],
  },
  { title: 'Description', fields: [{ path: 'description', label: 'Description de la chaîne (1000 caractères max.)', rows: 14 }] },
  {
    title: 'Vidéo de présentation',
    fields: [
      { path: 'welcome.title', label: 'Titre', rows: 2 },
      { path: 'welcome.pitch', label: 'Résumé', rows: 3 },
    ],
  },
  {
    title: 'Appels à l’action',
    fields: [
      { path: 'cta.video', label: 'Vers une autre vidéo', rows: 2 },
      { path: 'cta.meeting', label: 'Vers une prise de rendez-vous', rows: 2 },
    ],
  },
]

export default function YoutubeFn() {
  const { texts: t, set, reset, edited } = useEditableTexts<YtTexts>('plaquette-youtube-fn', YT_DEFAULTS)
  const ident = useIdentity()
  const [device, setDevice] = useDevice()
  const [tab, setTab] = useState<'mock' | 'thumbs' | 'formats' | 'strategy' | 'texts' | 'visuals' | 'validate'>('mock')
  return (
    <Page wide>
      <PageHeader
        eyebrow="Plateformes · YouTube"
        title="Chaîne YouTube Fynovates"
        description={
          <>
            La chaîne de référence : identité, page d’accueil, rubriques, miniatures, formats éditoriaux, rythme et appels à l’action. Maquette de travail indépendante — aucune connexion à YouTube, aucune publication. Idées de vidéos détaillées :{' '}
            <Link to="/longform" className="underline underline-offset-2">Long formats YouTube</Link>.
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'mock', label: 'Maquette' },
            { value: 'thumbs', label: 'Miniatures' },
            { value: 'formats', label: 'Formats éditoriaux' },
            { value: 'strategy', label: 'Publication & CTA' },
            { value: 'texts', label: 'Textes' },
            { value: 'visuals', label: 'Visuels' },
            { value: 'validate', label: 'À valider', count: YT_TO_VALIDATE.length },
          ]}
        />
        {tab === 'mock' && <DeviceSwitch value={device} onChange={setDevice} />}
      </div>

      {tab === 'mock' && (
        <div className="rounded-2xl border border-line bg-white p-3 md:p-6" data-mock="youtube">
          <FitWidth width={WIDTH[device]}>
            <YoutubeMock t={t} device={device} />
          </FitWidth>
          <p className="mt-3 text-center text-[11.5px] text-[#666]">Simulation de mise en page · les compteurs (abonnés, vues) ne sont pas représentés</p>
        </div>
      )}
      {tab === 'thumbs' && <Thumbs />}
      {tab === 'formats' && <Formats />}
      {tab === 'strategy' && <Strategy t={t} />}
      {tab === 'texts' && <TextsEditor groups={GROUPS} texts={t} set={set} reset={reset} edited={edited} exportName="chaine-youtube-fynovates" readOnly={!ident.canEdit} />}
      {tab === 'visuals' && <Visuals t={t} edited={edited} />}
      {tab === 'validate' && (
        <Section title="Éléments à valider par l’équipe Fynovates">
          <ToValidate items={YT_TO_VALIDATE} />
        </Section>
      )}
    </Page>
  )
}

/* ---------------- mock ---------------- */

function VideoCard({ v, width }: { v: YtVideo; width?: number }) {
  return (
    <div className="min-w-0" style={width ? { width, flex: 'none' } : undefined} data-mock-video={v.id}>
      <div className="relative overflow-hidden rounded-xl ring-1 ring-black/10">
        <Scaled w={YT_THUMB.w} h={YT_THUMB.h}>
          <YtThumb v={v} />
        </Scaled>
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11.5px] font-medium text-white">{v.duration}</span>
      </div>
      <div className="mt-2.5 line-clamp-2 text-[14px] font-semibold leading-snug text-[#0f0f0f]">{v.title}</div>
      <div className="mt-1 text-[12.5px] text-[#606060]">
        {v.category} · {formatOf(v)}
      </div>
    </div>
  )
}

function Row({ title, children, device }: { title: string; children: React.ReactNode; device: Device }) {
  return (
    <section className="border-t border-[#e5e5e5] py-6" data-mock-section={title}>
      <h2 className="mb-4 text-[19px] font-bold text-[#0f0f0f]">{title}</h2>
      <div className={device === 'mobile' ? 'flex gap-3 overflow-x-auto pb-2' : device === 'tablet' ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-4 gap-4'}>{children}</div>
    </section>
  )
}

export function YoutubeMock({ t, device }: { t: YtTexts; device: Device }) {
  const mobile = device === 'mobile'
  const perRow = device === 'desktop' ? 4 : 3
  return (
    <div className="text-[#0f0f0f]" style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}>
      <div className="mb-4 flex items-center gap-3 border-b border-[#eee] pb-3">
        <div className="h-9 max-w-[520px] flex-1 rounded-full border border-[#ddd] bg-[#f8f8f8]" />
        <span className="text-[11px] tracking-[0.12em] text-[#888]">MAQUETTE</span>
      </div>
      {/* banner: the band shown on computer, or the safe area on mobile */}
      <div className="overflow-hidden rounded-xl" data-mock-section="banner">
        {mobile ? (
          <Scaled w={1546} h={423}>
            <div style={{ marginLeft: -507, marginTop: -508 }}>
              <YtBanner t={t} />
            </div>
          </Scaled>
        ) : (
          <Scaled w={2560} h={423}>
            <div style={{ marginTop: -508 }}>
              <YtBanner t={t} />
            </div>
          </Scaled>
        )}
      </div>
      <div className={`mt-4 flex ${mobile ? 'flex-col gap-3' : 'items-center gap-6'}`} data-mock-section="header">
        <div className={`${mobile ? 'h-[72px] w-[72px]' : 'h-[160px] w-[160px]'} shrink-0 overflow-hidden rounded-full`}>
          <Scaled w={YT_AVATAR.w} h={YT_AVATAR.h}>
            <YtAvatar />
          </Scaled>
        </div>
        <div className="min-w-0">
          <h1 className={`${mobile ? 'text-[24px]' : 'text-[36px]'} font-bold leading-tight`}>{t.name}</h1>
          <p className="mt-1 text-[14px] text-[#606060]">
            <span className="font-semibold text-[#0f0f0f]">{t.handle}</span> · abonnés · vidéos
          </p>
          <p className="mt-1.5 line-clamp-1 max-w-[640px] text-[14px] text-[#606060]">{t.description.split('\n')[0]} …plus</p>
          <p className="mt-1 text-[14px] font-medium" style={{ color: NAVY }}>
            {t.website}
          </p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full px-4 py-2 text-[14px] font-semibold text-white" style={{ background: '#0f0f0f' }}>
              S’abonner
            </span>
            <span className="rounded-full border px-4 py-2 text-[14px] font-semibold" style={{ borderColor: NAVY, color: NAVY }}>
              Prendre rendez-vous
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-6 overflow-x-auto border-b border-[#e5e5e5] text-[15px] font-semibold text-[#606060]">
        {['Accueil', 'Vidéos', 'Shorts', 'Playlists', 'Posts'].map((x, i) => (
          <span key={x} className={`shrink-0 pb-3 ${i === 0 ? 'border-b-2 border-[#0f0f0f] text-[#0f0f0f]' : ''}`}>
            {x}
          </span>
        ))}
      </div>

      <section className={`py-6 ${mobile ? 'space-y-3' : 'grid grid-cols-[minmax(0,440px)_1fr] gap-6'}`} data-mock-section="welcome">
        <div className="relative overflow-hidden rounded-xl ring-1 ring-black/10">
          <Scaled w={YT_THUMB.w} h={YT_THUMB.h}>
            <YtThumb v={{ ...YT_WELCOME, title: t.welcome.title }} />
          </Scaled>
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11.5px] text-white">{YT_WELCOME.duration}</span>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#606060]">Vidéo de présentation</div>
          <h2 className="mt-1.5 text-[18px] font-semibold leading-snug">{t.welcome.title}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#606060]">{t.welcome.pitch}</p>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[#0f0f0f] line-clamp-6">{t.description}</p>
        </div>
      </section>

      {YT_SECTIONS.map((s) => (
        <Row key={s.id} title={s.title} device={device}>
          {(mobile ? s.ids : s.ids.slice(0, perRow)).map((id) => (
            <VideoCard key={id} v={video(id)} width={mobile ? 250 : undefined} />
          ))}
        </Row>
      ))}

      <section className="border-t border-[#e5e5e5] py-6" data-mock-section="shorts">
        <h2 className="mb-4 text-[19px] font-bold">Shorts</h2>
        <div className={mobile ? 'flex gap-3 overflow-x-auto pb-2' : device === 'tablet' ? 'grid grid-cols-4 gap-3' : 'grid grid-cols-6 gap-3'}>
          {(device === 'tablet' ? YT_SHORTS.slice(0, 4) : YT_SHORTS).map((s) => (
            <div key={s.id} style={mobile ? { width: 150, flex: 'none' } : undefined}>
              <div className="overflow-hidden rounded-xl ring-1 ring-black/10">
                <Scaled w={YT_SHORT.w} h={YT_SHORT.h}>
                  <YtShortThumb s={s} />
                </Scaled>
              </div>
              <div className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">{s.title}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------------- thumbnails ---------------- */

function Thumbs() {
  const required = YT_VIDEOS.filter((v) => v.required)
  return (
    <div className="space-y-8">
      <Section title="Six miniatures de référence">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {required.map((v) => (
            <figure key={v.id} className="card overflow-hidden" data-thumb={v.id}>
              <Scaled w={YT_THUMB.w} h={YT_THUMB.h}>
                <YtThumb v={v} />
              </Scaled>
              <figcaption className="p-3">
                <div className="text-[13.5px] font-semibold">{v.title}</div>
                <div className="mt-0.5 text-[12px] text-ink-3">
                  {v.category} · {formatOf(v)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section title="Règles des miniatures">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Structure fixe', ['Wordmark officiel + rubrique en haut à gauche', 'Titre de 2 à 4 mots en capitales, très gras', 'Filet court puis sous-titre d’une ligne', 'Marges identiques sur toutes les miniatures']],
            ['Deux familles', ['Format A — Tiziana : photo studio réelle à droite, séparée par un filet blanc', 'Format B — pédagogie : schéma géométrique (liste, comparaison, flux, arborescence, grille, étapes)', 'Alterner A et B dans chaque rubrique']],
            ['Ce qu’on s’interdit', ['Flèches, émojis, visages grimaçants, rouge d’alerte', 'Chiffres, montants ou résultats', 'Globe, carte du monde, billets, graphiques boursiers', 'Monogramme F ou symbole inventé']],
          ].map(([t, items]) => (
            <div key={t as string} className="card p-4">
              <h3 className="text-[14px] font-semibold">{t as string}</h3>
              <ul className="mt-2 space-y-1">{(items as string[]).map((x) => <li key={x} className="text-[12.5px] leading-relaxed">— {x}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Shorts — couvertures verticales">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {YT_SHORTS.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-lg border border-line">
              <Scaled w={YT_SHORT.w} h={YT_SHORT.h}>
                <YtShortThumb s={s} />
              </Scaled>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] text-ink-3">Le texte reste dans les deux tiers supérieurs : le bas de l’écran est couvert par l’interface (titre, boutons).</p>
      </Section>
    </div>
  )
}

/* ---------------- formats ---------------- */

function Formats() {
  const a = video('v-expat')
  const b = video('v-structurer')
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[
        {
          v: a,
          name: 'Format A — Vidéos incarnées par Tiziana',
          role: 'La perspective : poser les enjeux, introduire les sujets complexes, partager une vision et l’expérience du terrain.',
          rules: ['Face caméra, cadre professionnel (bureau, studio), son et lumière maîtrisés', 'Dispositifs prévus : iPad + facecam, télévision + facecam', 'Ton naturel et dynamique, sans effet de créateur de contenu', 'Tiziana introduit, l’expert précise quand le sujet devient technique'],
          link: { to: '/mindmaps', label: 'Cartes mentales iPad pour les vidéos face caméra' },
        },
        {
          v: b,
          name: 'Format B — Vidéos pédagogiques Fynovates',
          role: 'La crédibilité technique : expliquer précisément, montrer, comparer.',
          rules: ['Motion design, schémas, cartes mentales, présentations visuelles', 'Interventions d’experts (identité à confirmer)', 'Une notion par chapitre, synthèse à l’écran', 'Explications fiscales, juridiques et comptables validées par l’expert compétent'],
          link: { to: '/longform', label: 'Dispositifs et idées de long formats' },
        },
      ].map((f) => (
        <article key={f.name} className="card overflow-hidden" data-format={f.name}>
          <Scaled w={YT_THUMB.w} h={YT_THUMB.h}>
            <YtThumb v={f.v} />
          </Scaled>
          <div className="p-4">
            <h3 className="text-[15px] font-semibold">{f.name}</h3>
            <p className="mt-1 text-[13px] text-ink-2">{f.role}</p>
            <ul className="mt-2.5 space-y-1">{f.rules.map((r) => <li key={r} className="text-[12.5px] leading-relaxed">— {r}</li>)}</ul>
            <Link to={f.link.to} className="mt-3 inline-block text-[12.5px] underline underline-offset-2">{f.link.label} →</Link>
          </div>
        </article>
      ))}
      <div className="card p-4 lg:col-span-2">
        <h3 className="text-[14px] font-semibold">Répartition sur la page d’accueil</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">Chaque rubrique alterne les deux formats : Tiziana incarne la vision et donne envie de regarder, les contenus Fynovates apportent la précision technique. La chaîne reste celle du cabinet : la bannière, la photo de profil et la description parlent au nom de Fynovates, jamais au nom d’une personne.</p>
      </div>
    </div>
  )
}

/* ---------------- strategy & CTA ---------------- */

const TIMELINE = [
  { label: 'Accroche', share: 6, text: 'La question du spectateur, la promesse de la vidéo' },
  { label: 'Introduction', share: 10, text: 'Le plan annoncé, pour qui est la vidéo' },
  { label: 'Développement', share: 64, text: '3 à 4 parties pédagogiques, une notion par partie' },
  { label: 'Conclusion', share: 12, text: 'La synthèse en trois points' },
  { label: 'Appel à l’action', share: 8, text: 'Vidéo suivante ou prise de rendez-vous' },
]

function Strategy({ t }: { t: YtTexts }) {
  return (
    <div className="space-y-8">
      <Section title="Rythme de publication">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Minimum', '1 vidéo longue / semaine', 'Dès le lancement'],
            ['Objectif', '2 à 3 vidéos longues / semaine', 'Quand la production est stabilisée'],
            ['Shorts', 'Plusieurs par semaine', 'Extraits des vidéos longues ou conçus pour le format court'],
          ].map(([k, v, n]) => (
            <div key={k} className="card p-4">
              <div className="eyebrow">{k}</div>
              <div className="mt-1 text-[17px] font-semibold">{v}</div>
              <div className="mt-1 text-[12.5px] text-ink-3">{n}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Structure d’une vidéo longue (15 à 20 minutes)">
        <div className="flex overflow-hidden rounded-lg border border-line" data-timeline>
          {TIMELINE.map((s, i) => (
            <div key={s.label} className="min-w-0 border-r border-line px-3 py-3 last:border-r-0" style={{ flex: `${Math.max(s.share, 12)} 1 0`, background: i === 2 ? NAVY : undefined, color: i === 2 ? '#fff' : undefined }}>
              <div className="text-[12.5px] font-semibold">{s.label}</div>
              <div className={`mt-0.5 text-[11.5px] leading-snug ${i === 2 ? 'text-white/75' : 'text-ink-3'}`}>{s.text}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] text-ink-3">Un sujet clairement défini par vidéo. Les Shorts reprennent un point de vigilance, une erreur à éviter ou un extrait du développement.</p>
      </Section>
      <Section title="Appels à l’action">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_1fr]">
          <figure className="card overflow-hidden">
            <Scaled w={1280} h={720}>
              <YtEndScreen t={t} next={video('v-res-err')} />
            </Scaled>
            <figcaption className="p-3 text-[12.5px] text-ink-3">Écran de fin type : vidéo suivante à gauche, prise de rendez-vous à droite.</figcaption>
          </figure>
          <div className="space-y-3">
            {[
              ['Vers une autre vidéo', t.cta.video, 'Quand le sujet se prolonge (série, approfondissement, sujet voisin).'],
              ['Vers une prise de rendez-vous', t.cta.meeting, 'Quand le sujet appelle une analyse personnalisée (départ, structuration, banque).'],
            ].map(([k, v, w]) => (
              <div key={k} className="card p-4">
                <div className="eyebrow">{k}</div>
                <p className="mt-1.5 text-[14px] font-medium leading-snug">« {v} »</p>
                <p className="mt-1.5 text-[12.5px] text-ink-3">{w}</p>
              </div>
            ))}
            <div className="card p-4">
              <div className="eyebrow">Dans la description de chaque vidéo</div>
              <ul className="mt-1.5 space-y-1 text-[12.5px] leading-relaxed">
                <li>— Deux premières lignes : le sujet et pour qui</li>
                <li>— Chapitres horodatés</li>
                <li>— Lien de prise de rendez-vous : {t.website}</li>
                <li>— Mention : information générale, chaque situation demande une analyse</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ---------------- visuals ---------------- */

function Visuals({ t, edited }: { t: YtTexts; edited: boolean }) {
  const [safe, setSafe] = useState(true)
  return (
    <div className="space-y-4">
      {edited && <p className="text-[12.5px] text-ink-3">Les aperçus reflètent vos textes modifiés ; les fichiers PNG téléchargeables correspondent aux textes d’origine.</p>}
      <AssetCard title="Bannière" spec="2560 × 1440 px · zone de sécurité 1546 × 423" file="youtube/banniere.png">
        <label className="mb-2 flex items-center gap-2 text-[12.5px]">
          <input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} data-safe-toggle /> Afficher les zones (télévision, ordinateur, mobile)
        </label>
        <Scaled w={YT_BANNER.w} h={YT_BANNER.h}>
          <YtBanner t={t} safe={safe} />
        </Scaled>
      </AssetCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AssetCard title="Photo de profil" spec="800 × 800 px, affichée en cercle" file="youtube/photo-profil.png">
          <div className="mx-auto max-w-[240px]">
            <Scaled w={YT_AVATAR.w} h={YT_AVATAR.h}>
              <YtAvatar />
            </Scaled>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            {[24, 40, 88].map((s) => (
              <div key={s} className="overflow-hidden rounded-full" style={{ width: s, height: s }}>
                <Scaled w={800} h={800}>
                  <YtAvatar />
                </Scaled>
              </div>
            ))}
          </div>
        </AssetCard>
        <AssetCard title="Écran de fin" spec="1280 × 720 px" file="youtube/ecran-de-fin.png">
          <Scaled w={1280} h={720}>
            <YtEndScreen t={t} next={video('v-res-err')} />
          </Scaled>
        </AssetCard>
        {YT_VIDEOS.filter((v) => v.required)
          .slice(0, 2)
          .map((v) => (
            <AssetCard key={v.id} title="Miniature" spec="1280 × 720 px" file={`youtube/miniature-${v.id}.png`}>
              <Scaled w={YT_THUMB.w} h={YT_THUMB.h}>
                <YtThumb v={v} />
              </Scaled>
            </AssetCard>
          ))}
      </div>
      <p className="text-[12.5px] text-ink-3">Toutes les miniatures et couvertures de Shorts sont téléchargeables dans le dossier public/plaquettes/youtube/.</p>
    </div>
  )
}
