import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { useIdentity } from '../../components/brand/BrandParts'
import { PageHeader, Section, Tabs } from '../../components/ui'
import { LF_DEFAULTS, LF_TO_VALIDATE, type LfTexts } from '../../lib/seed/linkedinFn'
import { AssetCard, DeviceSwitch, FitWidth, NAVY, Scaled, TextsEditor, ToValidate, useDevice, useEditableTexts, type Device, type TextGroup } from './kit'
import { LF_BANNER, LF_LOGO, LF_POST, LfBanner, LfLogo, LfPostVisual } from './linkedinVisuals'

const WIDTH: Record<Device, number> = { desktop: 1128, tablet: 768, mobile: 390 }

const GROUPS: TextGroup[] = [
  {
    title: 'En-tête',
    fields: [
      { path: 'name', label: 'Nom' },
      { path: 'tagline', label: 'Slogan (120 caractères max.)', rows: 2 },
      { path: 'banner.message', label: 'Bannière — phrase de positionnement', rows: 2 },
      { path: 'banner.domains', label: 'Bannière — domaines (séparés par |)' },
      { path: 'taglineOptions', label: 'Autres accroches proposées (une par ligne)', rows: 3 },
    ],
  },
  { title: 'À propos', fields: [{ path: 'about', label: 'Présentation', rows: 14 }] },
  {
    title: 'Informations de la page',
    fields: [
      { path: 'details.website', label: 'Site web' },
      { path: 'details.industry', label: 'Secteur' },
      { path: 'details.size', label: 'Taille de l’entreprise' },
      { path: 'details.headquarters', label: 'Siège social' },
      { path: 'details.founded', label: 'Date de création' },
      { path: 'details.specialties', label: 'Spécialisations', rows: 2 },
    ],
  },
  { title: 'Services', fields: LF_DEFAULTS.services.flatMap((_, i) => [{ path: `services.${i}.title`, label: `Service ${i + 1} — titre` }, { path: `services.${i}.text`, label: `Service ${i + 1} — description`, rows: 2 }]) },
  {
    title: 'Publications',
    fields: LF_DEFAULTS.posts.flatMap((p, i) => [
      { path: `posts.${i}.visualTitle`, label: `${p.category} — titre du visuel`, rows: 2 },
      { path: `posts.${i}.text`, label: `${p.category} — texte`, rows: 10 },
    ]),
  },
  {
    title: 'Coordonnées et conversion',
    fields: [
      { path: 'contact.cta', label: 'Bouton' },
      { path: 'contact.line', label: 'Mention sous le bouton' },
      { path: 'contact.channel', label: 'Moyen de contact' },
    ],
  },
]

export default function LinkedinFn() {
  const { texts: t, set, reset, edited } = useEditableTexts<LfTexts>('plaquette-linkedin-fn', LF_DEFAULTS)
  const ident = useIdentity()
  const [device, setDevice] = useDevice()
  const [tab, setTab] = useState<'mock' | 'sections' | 'texts' | 'visuals' | 'validate'>('mock')
  return (
    <Page wide>
      <PageHeader
        eyebrow="Plateformes · LinkedIn"
        title="Identité LinkedIn Fynovates"
        description={
          <>
            La page entreprise de référence : photo de profil, bannière, slogan, À propos, services, publications et conversion. Une maquette de travail pour construire et harmoniser la vraie page — aucune connexion à LinkedIn. Stratégie éditoriale détaillée :{' '}
            <Link to="/channel/li-fn" className="underline underline-offset-2">LinkedIn Fynovates</Link>.
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'mock', label: 'Maquette' },
            { value: 'sections', label: 'Les sections' },
            { value: 'texts', label: 'Textes' },
            { value: 'visuals', label: 'Visuels' },
            { value: 'validate', label: 'À valider', count: LF_TO_VALIDATE.length },
          ]}
        />
        {tab === 'mock' && <DeviceSwitch value={device} onChange={setDevice} />}
      </div>

      {tab === 'mock' && (
        <div className="rounded-2xl border border-line bg-[#F3F2EF] p-3 md:p-6" data-mock="linkedin">
          <FitWidth width={WIDTH[device]}>
            <LinkedinMock t={t} device={device} />
          </FitWidth>
          <p className="mt-3 text-center text-[11.5px] text-[#666]">Simulation de mise en page · les compteurs (abonnés, réactions) ne sont pas représentés</p>
        </div>
      )}
      {tab === 'sections' && <Sections t={t} />}
      {tab === 'texts' && <TextsEditor groups={GROUPS} texts={t} set={set} reset={reset} edited={edited} exportName="identite-linkedin-fynovates" readOnly={!ident.canEdit} />}
      {tab === 'visuals' && <Visuals t={t} edited={edited} />}
      {tab === 'validate' && (
        <Section title="Informations à valider par l’équipe Fynovates">
          <ToValidate items={LF_TO_VALIDATE} />
        </Section>
      )}
    </Page>
  )
}

/* ---------------- the mock ---------------- */

const card = 'rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]'

export function LinkedinMock({ t, device }: { t: LfTexts; device: Device }) {
  const mobile = device === 'mobile'
  const twoCols = device === 'desktop'
  const pad = mobile ? 'px-4' : 'px-6'
  return (
    <div className="font-sans text-[#191919]" style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}>
      {/* neutral top bar, no third-party branding */}
      <div className="mb-3 flex items-center gap-3 rounded-[10px] bg-white px-4 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
        <div className="h-7 flex-1 max-w-[280px] rounded-md bg-[#EDF3F8]" />
        <span className="text-[11px] tracking-[0.12em] text-[#666]">MAQUETTE</span>
      </div>
      <div className={twoCols ? 'grid grid-cols-[minmax(0,1fr)_300px] gap-6' : 'space-y-3'}>
        <div className="space-y-3">
          <section className={`${card} overflow-hidden`} data-mock-section="header">
            <Scaled w={LF_BANNER.w} h={LF_BANNER.h}>
              <LfBanner t={t} />
            </Scaled>
            <div className={`relative ${pad} pb-5`}>
              <div className={`${mobile ? '-mt-9 h-[72px] w-[72px]' : '-mt-16 h-[128px] w-[128px]'} overflow-hidden rounded-md border-4 border-white bg-white`}>
                <Scaled w={LF_LOGO.w} h={LF_LOGO.h}>
                  <LfLogo />
                </Scaled>
              </div>
              <h1 className={`${mobile ? 'mt-2 text-[20px]' : 'mt-3 text-[26px]'} font-semibold`}>{t.name}</h1>
              <p className={`${mobile ? 'text-[13.5px]' : 'text-[15px]'} mt-1 leading-snug`}>{t.tagline}</p>
              <p className="mt-1.5 text-[13px] text-[#666]">
                {t.details.industry} · {t.details.headquarters}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full px-4 py-1.5 text-[14px] font-semibold text-white" style={{ background: NAVY }}>
                  + Suivre
                </span>
                <span className="rounded-full border px-4 py-1.5 text-[14px] font-semibold" style={{ borderColor: NAVY, color: NAVY }}>
                  {t.contact.cta}
                </span>
                <span className="rounded-full border border-[#666] px-4 py-1.5 text-[14px] font-semibold text-[#444]">Visiter le site web ↗</span>
              </div>
            </div>
            <div className={`flex gap-5 overflow-x-auto border-t border-[#e8e8e8] ${pad} text-[14px] font-semibold text-[#666]`}>
              {['Accueil', 'À propos', 'Services', 'Posts', 'Personnes'].map((x, i) => (
                <span key={x} className={`shrink-0 py-3 ${i === 0 ? 'border-b-2 text-[#191919]' : ''}`} style={i === 0 ? { borderColor: NAVY } : undefined}>
                  {x}
                </span>
              ))}
            </div>
          </section>

          <section className={`${card} ${pad} py-5`} data-mock-section="about">
            <h2 className="text-[19px] font-semibold">À propos</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.55]">{t.about}</p>
            <dl className={`mt-5 grid gap-x-6 gap-y-3 text-[14px] ${mobile ? '' : 'grid-cols-[170px_1fr]'}`}>
              {(
                [
                  ['Site web', t.details.website],
                  ['Secteur', t.details.industry],
                  ['Taille de l’entreprise', t.details.size],
                  ['Siège social', t.details.headquarters],
                  ['Fondée en', t.details.founded],
                  ['Spécialisations', t.details.specialties],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-semibold">{k}</dt>
                  <dd className={v === 'À RENSEIGNER' ? 'text-[11.5px] font-semibold tracking-[0.06em] text-[#999]' : 'text-[#444]'}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`${card} ${pad} py-5`} data-mock-section="services">
            <h2 className="text-[19px] font-semibold">Services</h2>
            <div className={`mt-4 grid gap-3 ${mobile ? '' : 'grid-cols-2'}`}>
              {t.services.map((s, i) => (
                <div key={i} className={`rounded-lg border border-[#e3e3e3] p-4 ${!mobile && i === t.services.length - 1 && t.services.length % 2 ? 'col-span-2' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[12px] font-semibold text-white" style={{ background: NAVY }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] font-semibold">{s.title}</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-snug text-[#555]">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section data-mock-section="posts" className="space-y-3">
            <h2 className={`${mobile ? 'px-1' : ''} pt-2 text-[17px] font-semibold`}>Publications</h2>
            <div className={device === 'mobile' ? 'space-y-3' : 'grid grid-cols-2 gap-3'}>
              {t.posts.map((p, i) => (
                <article key={i} className={`${card} overflow-hidden`} data-mock-post={i}>
                  <div className="flex items-center gap-2.5 px-4 pt-3">
                    <div className="h-10 w-10 overflow-hidden rounded">
                      <Scaled w={LF_LOGO.w} h={LF_LOGO.h}>
                        <LfLogo />
                      </Scaled>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold">{t.name}</div>
                      <div className="text-[12px] text-[#666]">{p.category} · exemple de publication</div>
                    </div>
                  </div>
                  <p className="line-clamp-4 whitespace-pre-line px-4 pt-2.5 text-[13.5px] leading-snug">{p.text}</p>
                  <div className="px-4 pb-1 text-right text-[12.5px] text-[#666]">… voir plus</div>
                  <Scaled w={LF_POST.w} h={LF_POST.h}>
                    <LfPostVisual i={i} t={t} />
                  </Scaled>
                  <div className="flex justify-around border-t border-[#e8e8e8] py-2 text-[12.5px] font-semibold text-[#666]">
                    <span>J’aime</span>
                    <span>Commenter</span>
                    <span>Republier</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-3" data-mock-section="contact">
          <div className={`${card} p-5`}>
            <h2 className="text-[16px] font-semibold">Échanger avec le cabinet</h2>
            <p className="mt-2 text-[13.5px] leading-snug text-[#555]">Un projet à l’international, une question de fiscalité, de banque ou d’expatriation ?</p>
            <div className="mt-4 rounded-full py-2 text-center text-[14px] font-semibold text-white" style={{ background: NAVY }}>
              {t.contact.cta}
            </div>
            <p className="mt-2 text-center text-[12px] text-[#666]">{t.contact.line}</p>
            <dl className="mt-4 space-y-2 border-t border-[#eee] pt-4 text-[13px]">
              <div>
                <dt className="font-semibold">Site web</dt>
                <dd className="text-[#444]">{t.details.website}</dd>
              </div>
              <div>
                <dt className="font-semibold">Contact</dt>
                <dd className="text-[#444]">{t.contact.channel}</dd>
              </div>
            </dl>
          </div>
          <div className={`${card} p-5`}>
            <h2 className="text-[14px] font-semibold">Domaines</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.banner.domains.split('|').map((d) => (
                <span key={d} className="rounded-full border border-[#ddd] px-2.5 py-1 text-[12px] text-[#444]">
                  {d.trim()}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ---------------- sections explained ---------------- */

function Sections({ t }: { t: LfTexts }) {
  const items: { title: string; role: string; rules: string[] }[] = [
    { title: 'Photo de profil', role: 'Reconnaître le cabinet dans le fil d’actualité, même en très petit format.', rules: ['Logo officiel blanc sur bleu nuit #0D082E', 'Format carré 400 × 400', 'Aucun monogramme ni symbole ajouté'] },
    { title: 'Bannière', role: 'Dire en une seconde qui est Fynovates et pour qui.', rules: ['1128 × 191', 'Contenu aligné à droite : le logo recouvre le coin inférieur gauche', `Message : « ${t.banner.message} »`, `Domaines : ${t.banner.domains}`] },
    { title: 'Nom et slogan', role: 'Positionner le cabinet dans les résultats de recherche et sous le nom.', rules: [`Slogan retenu : « ${t.tagline} »`, 'Autres accroches dans l’onglet Textes'] },
    { title: 'À propos', role: 'Expliquer qui, pour qui, quels problèmes, quels domaines, comment contacter.', rules: ['Voix du « nous » (cabinet), jamais du « je »', 'Aucune promesse de résultat', 'Méthode visible, situations anonymisées'] },
    { title: 'Services', role: 'Lister clairement les cinq domaines d’accompagnement.', rules: t.services.map((s) => s.title) },
    { title: 'Publications', role: 'Démontrer l’expertise par des contenus pédagogiques réguliers.', rules: ['Quatre familles : fiscalité, expatriation, banque, vie du cabinet', 'Visuels à la charte (bleu nuit / blanc, wordmark, rubrique)', 'Aucun chiffre sans validation d’un expert'] },
    { title: 'Coordonnées et conversion', role: 'Transformer la visite en prise de rendez-vous.', rules: [`Bouton : « ${t.contact.cta} »`, `Site : ${t.details.website}`, t.contact.line] },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((x, i) => (
        <div key={x.title} className="card p-4">
          <div className="eyebrow">Section {String(i + 1).padStart(2, '0')}</div>
          <h3 className="mt-1 text-[15px] font-semibold">{x.title}</h3>
          <p className="mt-1 text-[13px] text-ink-2">{x.role}</p>
          <ul className="mt-2.5 space-y-1">
            {x.rules.map((r) => (
              <li key={r} className="text-[12.5px] leading-relaxed">— {r}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* ---------------- reference visuals ---------------- */

function Visuals({ t, edited }: { t: LfTexts; edited: boolean }) {
  return (
    <div className="space-y-4">
      {edited && <p className="text-[12.5px] text-ink-3">Les aperçus reflètent vos textes modifiés ; les fichiers PNG téléchargeables correspondent aux textes d’origine.</p>}
      <AssetCard title="Bannière" spec="1128 × 191 px (fichier @2x)" file="linkedin/banniere.png">
        <Scaled w={LF_BANNER.w} h={LF_BANNER.h}>
          <LfBanner t={t} />
        </Scaled>
      </AssetCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AssetCard title="Photo de profil" spec="400 × 400 px" file="linkedin/logo.png">
          <Scaled w={LF_LOGO.w} h={LF_LOGO.h}>
            <LfLogo />
          </Scaled>
        </AssetCard>
        {t.posts.map((p, i) => (
          <AssetCard key={i} title={p.category} spec="1080 × 1080 px" file={`linkedin/post-${i + 1}.png`}>
            <Scaled w={LF_POST.w} h={LF_POST.h}>
              <LfPostVisual i={i} t={t} />
            </Scaled>
          </AssetCard>
        ))}
      </div>
    </div>
  )
}
