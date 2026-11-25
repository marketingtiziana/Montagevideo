import { connector, H, layout, W } from './layout'
import { CLAIM_LABEL, type Claim, type MindMap } from './types'

/* Exports never contain private presenter notes. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Greedy word wrap with a conservative average glyph width. */
function wrap(text: string, width: number, size: number, upper = false, tracking = 0): string[] {
  const cw = size * (upper ? 0.68 : 0.53) + tracking * size
  const max = Math.max(4, Math.floor(width / cw))
  const words = (upper ? text.toUpperCase() : text).split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

interface Run {
  lines: string[]
  size: number
  lh: number
  weight: number
  fill: string
  upper?: boolean
  tracking?: number
  gapBefore: number
  rule?: boolean
}

function block(runs: Run[], x: number, y: number, w: number): string {
  let cy = y
  let out = ''
  for (const r of runs) {
    cy += r.gapBefore
    if (r.rule) out += `<line x1="${x}" y1="${cy}" x2="${x + w}" y2="${cy}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`
    for (const l of r.lines) {
      cy += r.size * r.lh
      out += `<text x="${x}" y="${cy - r.size * (r.lh - 1) * 0.5 - r.size * 0.18}" font-size="${r.size}" font-weight="${r.weight}" fill="${r.fill}"${r.tracking ? ` letter-spacing="${(r.tracking * r.size).toFixed(1)}"` : ''}>${esc(l)}</text>`
    }
  }
  return out
}
const runsHeight = (runs: Run[]) => runs.reduce((h, r) => h + r.gapBefore + r.lines.length * r.size * r.lh, 0)

export function buildSvg(map: MindMap, logoHref = 'brand/fynovates-wordmark-white.png'): string {
  const { centre, slots } = layout(map.branches.length)
  let body = ''
  for (let i = 0; i < map.branches.length; i++) {
    const s = slots[i]
    if (s) body += `<path d="${connector(centre, s)}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>`
  }
  // centre
  const cx = centre.x + centre.w / 2
  const logoW = 300
  const logoH = (logoW * 100) / 1464
  let k = 1
  let titleLines: string[] = []
  let subLines: string[] = []
  for (; k > 0.6; k -= 0.04) {
    titleLines = wrap(map.title, centre.w - 80, 38 * k)
    subLines = wrap(map.subtitle, centre.w - 80, 21 * k)
    const h = logoH + 50 + titleLines.length * 38 * k * 1.12 + 16 + subLines.length * 21 * k * 1.35
    if (h <= centre.h - 68) break
  }
  const contentH = logoH + 50 + titleLines.length * 38 * k * 1.12 + 16 + subLines.length * 21 * k * 1.35
  let ty = centre.y + (centre.h - contentH) / 2
  body += `<rect x="${centre.x}" y="${centre.y}" width="${centre.w}" height="${centre.h}" fill="#0D082E" stroke="rgba(255,255,255,0.34)"/>`
  body += `<rect x="${centre.x - 10}" y="${centre.y - 10}" width="${centre.w + 20}" height="${centre.h + 20}" fill="none" stroke="rgba(255,255,255,0.1)"/>`
  body += `<image href="${esc(logoHref)}" x="${cx - logoW / 2}" y="${ty}" width="${logoW}" height="${logoH}"/>`
  ty += logoH + 26
  body += `<line x1="${cx - 32}" y1="${ty}" x2="${cx + 32}" y2="${ty}" stroke="rgba(255,255,255,0.45)"/>`
  ty += 24
  for (const l of titleLines) {
    ty += 38 * k * 1.12
    body += `<text x="${cx}" y="${ty - 38 * k * 0.25}" text-anchor="middle" font-size="${38 * k}" font-weight="650" fill="#FFFFFF">${esc(l)}</text>`
  }
  ty += 16
  for (const l of subLines) {
    ty += 21 * k * 1.35
    body += `<text x="${cx}" y="${ty - 21 * k * 0.4}" text-anchor="middle" font-size="${21 * k}" fill="rgba(255,255,255,0.72)">${esc(l)}</text>`
  }
  // branches
  map.branches.forEach((b, i) => {
    const s = slots[i]
    if (!s) return
    const iw = s.w - 68
    let runs: Run[] = []
    for (let f = 1; f > 0.55; f -= 0.03) {
      runs = [
        { lines: [b.num], size: 22 * f, lh: 1.2, weight: 600, fill: 'rgba(255,255,255,0.6)', tracking: 0.14, gapBefore: 0 },
        { lines: wrap(b.title, iw, 33 * f, true, 0.06), size: 33 * f, lh: 1.16, weight: 650, fill: '#FFFFFF', upper: true, tracking: 0.06, gapBefore: 14 },
        { lines: wrap(b.phrase, iw, 23 * f), size: 23 * f, lh: 1.32, weight: 400, fill: 'rgba(255,255,255,0.66)', gapBefore: 10 },
        ...b.nodes.flatMap((n, j) => [{ lines: wrap(n.title, iw, 23 * f), size: 23 * f, lh: 1.28, weight: 400, fill: 'rgba(255,255,255,0.9)', gapBefore: j === 0 ? 26 : 16, rule: true }]),
      ]
      if (runsHeight(runs) <= s.h - 60) break
    }
    body += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#0D082E" stroke="rgba(255,255,255,0.14)"/>`
    body += `<line x1="${s.x + 34 + 60}" y1="${s.y + 30 + 14}" x2="${s.x + s.w - 34}" y2="${s.y + 30 + 14}" stroke="rgba(255,255,255,0.18)"/>`
    body += block(runs, s.x + 34, s.y + 30, iw)
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif">
<title>${esc(map.title)}</title>
<rect width="${W}" height="${H}" fill="#0F0A13"/>
${body}
</svg>
`
}

const claimsOf = (map: MindMap, ids: string[]) => ids.map((id) => map.claims.find((c) => c.id === id)).filter(Boolean) as Claim[]

export function buildNotesMd(map: MindMap): string {
  const L: string[] = [
    `# ${map.title} — notes de présentation`,
    '',
    `> ${map.subtitle}`,
    '',
    `Carte ${map.number} · version ${map.version} · ${map.updatedAt}`,
    '',
    `**Objectif :** ${map.objective}`,
    '',
    `_${map.disclaimer}_`,
    '',
    'Les notes privées du présentateur ne figurent jamais dans cet export.',
    '',
  ]
  for (const b of map.branches) {
    const n = b.notes
    L.push(`## ${b.num} — ${b.title}`, '', `_${b.phrase}_`, '')
    if (n.mainIdea) L.push(`**Idée clé :** ${n.mainIdea}`, '')
    if (n.points.length) L.push('**Points à développer :**', ...n.points.map((p, i) => `${i + 1}. ${p}`), '')
    if (n.explanation) L.push(`**Explication :** ${n.explanation}`, '')
    if (n.example) L.push(`**Exemple :** ${n.example}`, '')
    if (n.nuance) L.push(`**Nuance :** ${n.nuance}`, '')
    if (n.misconceptions.length) L.push('**Idées reçues à corriger :**', ...n.misconceptions.map((x) => `- ${x}`), '')
    if (n.questions.length) L.push('**Questions à poser :**', ...n.questions.map((x) => `- ${x}`), '')
    L.push('**Nœuds :**', ...b.nodes.map((x) => `- ${x.title}${x.detail ? ` — ${x.detail}` : ''}`), '')
    const cl = claimsOf(map, b.claimIds)
    if (cl.length) L.push('**Affirmations à vérifier :**', ...cl.map((c) => `- [${c.status}] ${c.id} — ${c.reference}`), '')
    if (n.transition) L.push(`**Transition :** ${n.transition}`, '')
    if (n.conclusion) L.push(`**Conclusion de section :** ${n.conclusion}`, '')
  }
  return L.join('\n')
}

export function buildSourcesMd(map: MindMap): string {
  const L: string[] = [
    `# ${map.title} — sources et validation`,
    '',
    'Registre des affirmations fiscales ou juridiques de la carte. Aucun taux, seuil, délai ni montant n’est affirmé. Une affirmation ne peut être publiée telle quelle qu’au statut VALIDATED, après vérification par un professionnel compétent à la date de publication.',
    '',
    '| Statut | Nombre |',
    '|---|---|',
    ...(['RESEARCH REQUIRED', 'PENDING VALIDATION', 'VALIDATED'] as const).map((s) => `| ${s} (${CLAIM_LABEL[s]}) | ${map.claims.filter((c) => c.status === s).length} |`),
    '',
  ]
  for (const c of map.claims) {
    const used = map.branches.filter((b) => b.claimIds.includes(c.id)).map((b) => `${b.num} ${b.title}`)
    L.push(
      `## ${c.id} — ${c.status}`,
      '',
      c.text,
      '',
      `- **Juridiction :** ${c.jurisdiction || 'À RENSEIGNER'}`,
      `- **Date d’application :** ${c.date || 'À RENSEIGNER'}`,
      `- **Source officielle :** ${c.source || 'À RENSEIGNER'}`,
      `- **Référence :** ${c.reference || 'À RENSEIGNER'}`,
      `- **Lien :** ${c.url || 'À RENSEIGNER'}`,
      `- **Utilisée dans :** ${used.join(' ; ') || '—'}`,
      '',
    )
  }
  return L.join('\n')
}
