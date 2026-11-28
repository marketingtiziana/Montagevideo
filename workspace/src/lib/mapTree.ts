import { BRANDS, FORMATS, PILLAR_IDS, PILLARS, PLATFORMS } from './constants'
import { longforms, setups } from './seed/longform'
import { ctas } from './seed/cta'
import { isToClassify, pickImage } from './hooks'
import type { Brand, Channel, Content, ImageAsset, Journey, MatrixRow, PlatformId, Problem, Rule, Validation } from './types'

export type Ref = { t: 'c' | 'p' | 'i' | 'l'; id: string } | { t: 'route'; to: string }

export interface TreeNode {
  id: string
  label: string
  kind: 'territory' | 'branch' | 'leaf' | 'entity' | 'image'
  num?: string
  color?: string
  meta?: string
  ref?: Ref
  validation?: Validation
  imageId?: string
  children: TreeNode[]
}

export interface MapData {
  contents: Content[]
  problems: Problem[]
  images: ImageAsset[]
  channels: Channel[]
  brands: Brand[]
  journeys: Journey[]
  matrix: MatrixRow[]
  rules: Rule[]
}

const leaf = (id: string, label: string, extra: Partial<TreeNode> = {}): TreeNode => ({ id, label, kind: 'leaf', children: [], ...extra })
const branch = (id: string, label: string, children: TreeNode[], extra: Partial<TreeNode> = {}): TreeNode => ({
  id,
  label,
  kind: 'branch',
  children,
  meta: children.length ? String(children.length) : undefined,
  ...extra,
})

function contentNode(prefix: string, c: Content, children: TreeNode[] = [], platform?: PlatformId): TreeNode {
  return {
    id: `${prefix}/c:${c.id}`,
    label: c.hook && c.hook !== 'À RENSEIGNER' && c.hook.length < 90 ? c.hook : c.subject,
    kind: 'entity',
    num: c.id,
    color: BRANDS[c.brands[0]].color,
    meta: FORMATS[c.format],
    ref: { t: 'c', id: c.id },
    validation: c.validation,
    imageId: pickImage(c, platform)?.id,
    children,
  }
}

const CHANNEL_TERRITORY: Record<PlatformId, string> = {
  'yt-fn': 'T05',
  'ig-fn': 'T06',
  'tt-fn': 'T07',
  'li-fn': 'T08',
  'ig-tz': 'T09',
  'li-tz': 'T10',
}

export function journeyFor(c: Content): string | null {
  if (/comment/i.test(c.cta)) return 'J-DECOUVERTE'
  if (/rendez-vous|message|écris|contact|lien en bio/i.test(c.cta)) return 'J-INTENTION'
  if (c.brands.length === 1 && c.brands[0] === 'TZ' && c.platforms.includes('ig-tz')) return 'J-BRANDING'
  return null
}

export function buildTree(d: MapData): TreeNode[] {
  const byPillar = (p: string) => d.problems.filter((x) => x.pillar === p)
  const contentsOf = (pbId: string) => d.contents.filter((c) => c.problemIds.includes(pbId))
  const brand = (id: 'FN' | 'TZ') => d.brands.find((b) => b.id === id)

  const T = (num: string, label: string, children: TreeNode[], ref?: Ref): TreeNode => ({
    id: `T${num}`,
    num,
    label,
    kind: 'territory',
    children,
    ref,
    meta: undefined,
  })

  const sectionNodes = (prefix: string, sections: { id: string; title: string; items: { id: string; text: string; validation: Validation }[] }[]) =>
    sections.map((s) =>
      branch(
        `${prefix}/s:${s.id}`,
        s.title,
        s.items.map((it) => leaf(`${prefix}/i:${it.id}`, it.text, { validation: it.validation })),
      ),
    )

  const channelTerritory = (num: string, pid: PlatformId) => {
    const ch = d.channels.find((c) => c.id === pid)
    const list = d.contents.filter((c) => c.platforms.includes(pid))
    const prefix = `T${num}`
    return T(
      num,
      PLATFORMS[pid].label,
      [
        ...(ch ? [leaf(`${prefix}/role`, ch.role, { meta: 'Rôle' })] : []),
        ...(ch ? sectionNodes(prefix, ch.sections) : []),
        branch(
          `${prefix}/contents`,
          'Contenus',
          list.map((c) => contentNode(`${prefix}/contents`, c, [], pid)),
          { color: PLATFORMS[pid].color },
        ),
      ],
      { t: 'route', to: `/channel/${pid}` },
    )
  }

  const imgNode = (prefix: string, img: ImageAsset): TreeNode => ({
    id: `${prefix}/img:${img.id}`,
    label: img.description || img.originalName,
    kind: 'image',
    num: img.id,
    imageId: img.id,
    ref: { t: 'i', id: img.id },
    validation: img.validation,
    children: [],
  })

  const stories = d.contents.filter((c) => c.format === 'story')
  const visuals = d.contents.filter((c) => ['infographie', 'tableau-comparatif', 'carrousel', 'carrousel-pdf', 'carrousel-photo', 'document-pdf'].includes(c.format))
  const toClassify = d.images.filter(isToClassify)

  return [
    T('01', 'Vision stratégique', [
      leaf('T01/goal', 'Centraliser la stratégie marketing, éditoriale, commerciale et artistique de Fynovates et de Tiziana', { validation: 'VALIDÉ' }),
      leaf('T01/two', 'Deux marques distinctes : un cabinet (Fynovates) et une dirigeante (Tiziana / Madame Caci)', { validation: 'VALIDÉ' }),
      leaf('T01/chain', 'Chaque contenu relie une problématique prospect, un pilier, une marque, une plateforme, un visuel et un objectif commercial', { validation: 'VALIDÉ' }),
      branch(
        'T01/rules',
        'Règles de fidélité et de conversion',
        d.rules.map((r) => leaf(`T01/r:${r.id}`, r.text, { validation: r.validation, meta: r.scope })),
      ),
    ]),
    T(
      '02',
      'Architecture des marques',
      (['FN', 'TZ'] as const).map((b) => {
        const br = brand(b)
        return branch(`T02/${b}`, BRANDS[b].label, br ? [leaf(`T02/${b}/pos`, br.positioning, { meta: 'Positionnement' }), ...sectionNodes(`T02/${b}`, br.sections)] : [], {
          color: BRANDS[b].color,
        })
      }),
      { t: 'route', to: '/brand/FN' },
    ),
    T(
      '03',
      'Visual Brand System',
      [
        branch('T03/FN', 'Fynovates — références', d.images.filter((i) => i.brand === 'FN').map((i) => imgNode('T03/FN', i)), { color: BRANDS.FN.color }),
        branch('T03/TZ', 'Tiziana — références', d.images.filter((i) => i.brand === 'TZ').map((i) => imgNode('T03/TZ', i)), { color: BRANDS.TZ.color }),
        branch('T03/todo', 'Visuels à classer', toClassify.map((i) => imgNode('T03/todo', i))),
      ],
      { t: 'route', to: '/da/FN' },
    ),
    T(
      '04',
      'Banque des problématiques prospects',
      PILLAR_IDS.map((p) =>
        branch(
          `T04/${p}`,
          `${p} · ${PILLARS[p].label}`,
          byPillar(p).map((pb) => ({
            id: `T04/p:${pb.id}`,
            label: pb.title,
            kind: 'entity' as const,
            num: pb.id,
            color: PILLARS[p].color,
            ref: { t: 'p' as const, id: pb.id },
            validation: pb.validation,
            meta: `${contentsOf(pb.id).length} contenu(s)`,
            children: contentsOf(pb.id).map((c) => contentNode(`T04/p:${pb.id}`, c)),
          })),
          { color: PILLARS[p].color },
        ),
      ),
      { t: 'route', to: '/insights' },
    ),
    channelTerritory('05', 'yt-fn'),
    channelTerritory('06', 'ig-fn'),
    channelTerritory('07', 'tt-fn'),
    channelTerritory('08', 'li-fn'),
    channelTerritory('09', 'ig-tz'),
    channelTerritory('10', 'li-tz'),
    T(
      '11',
      'Stories',
      [
        branch('T11/FN', 'Séquences Fynovates', stories.filter((c) => c.brands.includes('FN')).map((c) => contentNode('T11/FN', c)), { color: BRANDS.FN.color }),
        branch('T11/TZ', 'Stories Tiziana', stories.filter((c) => c.brands.includes('TZ')).map((c) => contentNode('T11/TZ', c)), { color: BRANDS.TZ.color }),
      ],
      { t: 'route', to: '/channel/ig-fn' },
    ),
    T(
      '12',
      'Infographies et carrousels',
      [
        branch('T12/info', 'Infographies', visuals.filter((c) => c.format === 'infographie' || c.format === 'tableau-comparatif').map((c) => contentNode('T12/info', c))),
        branch('T12/car', 'Carrousels', visuals.filter((c) => c.format !== 'infographie' && c.format !== 'tableau-comparatif').map((c) => contentNode('T12/car', c))),
      ],
      { t: 'route', to: '/templates' },
    ),
    T(
      '13',
      'Déclinaisons multi-plateformes',
      d.matrix.map((r) =>
        branch(
          `T13/${r.id}`,
          r.topic,
          (Object.keys(r.cells) as PlatformId[]).map((p) =>
            leaf(`T13/${r.id}/${p}`, `${PLATFORMS[p].label} — ${r.cells[p]!.angle}`, {
              meta: r.cells[p]!.format,
              color: PLATFORMS[p].color,
              ref: r.cells[p]!.contentId ? { t: 'c', id: r.cells[p]!.contentId! } : undefined,
            }),
          ),
          { validation: r.validation },
        ),
      ),
      { t: 'route', to: '/matrix' },
    ),
    T(
      '14',
      'Conversion, parcours et CTA',
      [
        ...d.journeys.map((j) =>
          branch(
            `T14/${j.id}`,
            j.name,
            [
              ...j.steps.map((s) => leaf(`T14/${j.id}/${s.id}`, `${s.label} — ${s.detail}`)),
              ...ctas.filter((c) => c.journey === j.id).map((c) => leaf(`T14/${j.id}/cta-${c.id}`, `CTA : « ${c.wordings[0]} »`, { meta: c.name, validation: c.validation })),
            ],
            { validation: j.validation },
          ),
        ),
        branch(
          'T14/cta-soft',
          'Sans CTA commercial',
          [ctas.find((c) => c.id === 'soft')!].map((c) => leaf('T14/cta-soft/x', c.how, { meta: c.where.join(' · '), validation: c.validation })),
        ),
      ],
      { t: 'route', to: '/journeys' },
    ),
    T(
      '15',
      'Long formats YouTube',
      setups.map((st) =>
        branch(
          `T15/${st.id}`,
          st.name,
          longforms
            .filter((l) => l.setup === st.id)
            .map((l) => ({
              id: `T15/${st.id}/${l.id}`,
              label: l.title,
              kind: 'entity' as const,
              num: l.id,
              color: BRANDS[st.brand].color,
              meta: st.duration,
              ref: { t: 'l' as const, id: l.id },
              children: [],
            })),
          { color: BRANDS[st.brand].color },
        ),
      ),
      { t: 'route', to: '/longform' },
    ),
  ]
}

export const territoryForPlatform = (p: PlatformId) => CHANNEL_TERRITORY[p]
