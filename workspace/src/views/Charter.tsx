import { Check, Copy, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { ImageTile } from '../components/Cards'
import { EmptyState, PageHeader, Section } from '../components/ui'
import { getImage } from '../lib/hooks'
import { charters } from '../lib/seed/da'
import type { BrandId, ImageAsset } from '../lib/types'

function contrastText(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return l > 0.6 ? '#17171a' : '#ffffff'
}

function SwatchCard({ name, hex, usage, source }: { name: string; hex: string; usage: string; source: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button type="button" onClick={copy} className="flex h-28 w-full items-end justify-between p-3 text-left" style={{ background: hex, color: contrastText(hex) }} aria-label={`Copier ${hex}`}>
        <span className="font-mono text-[13px] font-medium">{hex}</span>
        {copied ? <Check size={14} /> : <Copy size={13} className="opacity-60" />}
      </button>
      <div className="p-3">
        <div className="text-[13px] font-semibold">{name}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{usage}</p>
        <div className="mt-1.5 text-[10.5px] text-ink-3">Relevé sur {source}</div>
      </div>
    </div>
  )
}

export default function Charter() {
  const { id } = useParams<{ id: BrandId }>()
  const ch = id ? charters[id] : undefined
  if (!ch || !id) return <Page><EmptyState title="Charte introuvable" /></Page>
  const examples = ch.examples.map(getImage).filter(Boolean) as ImageAsset[]
  const isTZ = id === 'TZ'

  return (
    <Page wide>
      <PageHeader eyebrow="Direction artistique" title={isTZ ? 'Charte Tiziana / Madame Caci' : 'Charte Fynovates'} description={ch.intro} />

      <Section title={isTZ ? 'Tonalités' : 'Codes couleur'} aside={<span className="text-[11.5px] text-ink-3">Clique sur une couleur pour copier le code</span>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {ch.palette.map((s) => (
            <SwatchCard key={s.hex} {...s} />
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-ink-3">{ch.paletteNote}</p>
      </Section>

      <Section title="Typographies">
        <div className="divide-y divide-line rounded-xl border border-line bg-surface">
          {ch.typography.map((t) => (
            <div key={t.role} className="grid gap-3 p-4 md:grid-cols-[200px_1fr_1.2fr] md:items-center">
              <div>
                <div className="eyebrow">{t.role}</div>
                <div className="mt-1 text-[13px] font-medium">{t.font}</div>
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-3">{t.detail}</p>
              <div className="rounded-lg bg-surface-2 p-4">
                <span style={t.style}>{t.sample}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-ink-3">{ch.typographyNote}</p>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Codes graphiques">
          <ul className="space-y-2">
            {ch.codes.map((c) => (
              <li key={c} className="flex gap-2.5 text-[13px] leading-relaxed">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                {c}
              </li>
            ))}
          </ul>
        </Section>
        <Section title={isTZ ? 'Catégories photographiques' : 'Style photographique'}>
          <div className="flex flex-wrap gap-1.5">
            {ch.photo.map((p) => (
              <span key={p} className="rounded-md border border-line bg-surface px-2.5 py-1 text-[12.5px]">
                {p}
              </span>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--v-ok)]">
            <Check size={14} /> À faire
          </div>
          <ul className="space-y-1.5">
            {ch.dos.map((d) => (
              <li key={d} className="text-[13px]">{d}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--v-expert)_28%,var(--line))] bg-surface p-4">
          <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--v-expert)]">
            <X size={14} /> Interdit
          </div>
          <ul className="space-y-1.5">
            {ch.donts.map((d) => (
              <li key={d} className="text-[13px]">{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <Section title="Exemples visuels" className="mt-10" aside={<Link to="/templates" className="text-[12px] text-ink-3 hover:text-ink">Voir les templates →</Link>}>
        {isTZ && (
          <p className="mb-4 text-[12.5px] text-ink-3">
            IMG-002 est la planche de proposition du compte. Les autres images sont des captures de comptes tiers, gardées comme inspiration pour le code « bandeaux blancs » : ce ne sont pas des photos de Tiziana.
          </p>
        )}
        <div className="columns-2 gap-4 md:columns-3 xl:columns-4">
          {examples.map((img) => (
            <ImageTile key={img.id} img={img} natural />
          ))}
        </div>
      </Section>
    </Page>
  )
}
