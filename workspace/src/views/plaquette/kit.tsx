import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { download } from '../../lib/brand/store'
import { Button, Field, TextArea } from '../../components/ui'

/* Shared building blocks of the "plaquettes" (LinkedIn, YouTube mockups). */

export const NAVY = '#0D082E'
export const INK = '#0F0A13'
const BASE = import.meta.env.BASE_URL
export const LOGO_WHITE = `${BASE}brand/fynovates-logo-white.svg`
export const LOGO_NAVY = `${BASE}brand/fynovates-logo-navy.svg`
export const photo = (n: 1 | 2 | 3 | 4) => `${BASE}plaquettes/photos/tz-${n}.jpg`
export const assetUrl = (path: string) => `${BASE}plaquettes/${path}`

/** Official wordmark (vector file, never redrawn). */
export function Wordmark({ width, tone = 'white', style }: { width: number | string; tone?: 'white' | 'navy'; style?: CSSProperties }) {
  return <img src={tone === 'white' ? LOGO_WHITE : LOGO_NAVY} alt="FYNOVATES" draggable={false} style={{ width, height: 'auto', display: 'block', ...style }} />
}

/** Renders children at a fixed native size and scales them to the available width. */
export function Scaled({ w, h, children, className = '', max = Infinity }: { w: number; h: number; children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const up = () => setK(Math.min(max, el.clientWidth / w))
    up()
    const ro = new ResizeObserver(up)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w, max])
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ height: k ? h * k : undefined, aspectRatio: k ? undefined : `${w} / ${h}` }}>
      {k > 0 && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${k})` }}>
          {children}
        </div>
      )}
    </div>
  )
}

/** Renders a mock at a fixed design width (natural height) and scales it down to fit. */
export function FitWidth({ width, children }: { width: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  const [h, setH] = useState<number | undefined>()
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const up = () => {
      const kk = Math.min(1, o.clientWidth / width)
      setK(kk)
      setH(i.offsetHeight * kk)
    }
    up()
    const ro = new ResizeObserver(up)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={outer} className="relative w-full overflow-hidden" style={{ height: h }}>
      <div ref={inner} className="absolute left-1/2 top-0" style={{ width, transform: `translateX(-50%) scale(${k})`, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  )
}

export type Device = 'desktop' | 'tablet' | 'mobile'
export const DEVICES: { value: Device; label: string }[] = [
  { value: 'desktop', label: 'Ordinateur' },
  { value: 'tablet', label: 'Tablette' },
  { value: 'mobile', label: 'Mobile' },
]

export function useDevice(): [Device, (d: Device) => void] {
  const [d, setD] = useState<Device>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'mobile' : 'desktop'))
  return [d, setD]
}

export function DeviceSwitch({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  return (
    <div role="tablist" aria-label="Appareil" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {DEVICES.map((d) => (
        <button
          key={d.value}
          type="button"
          role="tab"
          aria-selected={value === d.value}
          data-device={d.value}
          onClick={() => onChange(d.value)}
          className={`rounded-md px-3 py-1.5 text-[12.5px] ${value === d.value ? 'bg-ink text-bg' : 'text-ink-2 hover:text-ink'}`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- editable texts (stored in this browser) ---------------- */

type Json = Record<string, unknown>
const getPath = (o: unknown, path: string): unknown => path.split('.').reduce<unknown>((a, k) => (a == null ? a : (a as Json)[k]), o)
function setPath<T>(o: T, path: string, v: unknown): T {
  const keys = path.split('.')
  const clone = structuredClone(o) as Json
  let cur: Json = clone
  keys.slice(0, -1).forEach((k) => (cur = cur[k] as Json))
  cur[keys[keys.length - 1]] = v
  return clone as T
}

export function useEditableTexts<T>(key: string, defaults: T) {
  const [texts, setTexts] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
    } catch {
      return defaults
    }
  })
  useEffect(() => {
    try {
      if (JSON.stringify(texts) === JSON.stringify(defaults)) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(texts))
    } catch {
      /* storage unavailable */
    }
  }, [key, texts, defaults])
  const set = useCallback((path: string, v: string) => setTexts((t) => setPath(t, path, v)), [])
  const reset = useCallback(() => setTexts(defaults), [defaults])
  const edited = JSON.stringify(texts) !== JSON.stringify(defaults)
  return { texts, set, reset, edited }
}

export interface TextField {
  path: string
  label: string
  rows?: number
  hint?: string
}
export interface TextGroup {
  title: string
  fields: TextField[]
}

export function TextsEditor({ groups, texts, set, reset, edited, exportName, readOnly }: { groups: TextGroup[]; texts: unknown; set: (p: string, v: string) => void; reset: () => void; edited: boolean; exportName: string; readOnly?: boolean }) {
  const md = () =>
    groups
      .map((g) => `## ${g.title}\n\n` + g.fields.map((f) => `**${f.label}**\n\n${String(getPath(texts, f.path) ?? '')}\n`).join('\n'))
      .join('\n')
  return (
    <div className="space-y-6" data-texts-editor>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px]">
        <span className="text-ink-2">{edited ? 'Textes modifiés dans ce navigateur' : 'Textes d’origine'}</span>
        <span className="flex-1" />
        <Button size="sm" onClick={() => download(`${exportName}.md`, `# ${exportName}\n\n${md()}`)}>
          Exporter les textes (MD)
        </Button>
        <Button size="sm" variant="ghost" disabled={!edited || readOnly} onClick={reset}>
          Revenir aux textes d’origine
        </Button>
      </div>
      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="mb-2 text-[13px] font-semibold">{g.title}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f.path} label={f.label} hint={f.hint ? <span className="text-[11px] text-ink-3">{f.hint}</span> : undefined} className={(f.rows ?? 1) > 2 ? 'md:col-span-2' : ''}>
                {readOnly ? (
                  <div className="whitespace-pre-line rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[13px]">{String(getPath(texts, f.path) ?? '')}</div>
                ) : (
                  <TextArea rows={f.rows ?? 1} value={String(getPath(texts, f.path) ?? '')} onCommit={(v) => set(f.path, v)} />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ---------------- small presentational helpers ---------------- */

export function ToValidate({ items }: { items: { what: string; why: string }[] }) {
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-surface" data-to-validate>
      {items.map((x) => (
        <li key={x.what} className="flex flex-wrap gap-x-4 gap-y-0.5 px-4 py-2.5 text-[13px]">
          <span className="min-w-[240px] flex-1 font-medium">{x.what}</span>
          <span className="flex-[2] text-ink-2">{x.why}</span>
        </li>
      ))}
    </ul>
  )
}

export function AssetCard({ title, spec, file, children }: { title: string; spec: string; file?: string; children: ReactNode }) {
  return (
    <figure className="card overflow-hidden" data-asset-card={title}>
      <div className="bg-surface-2 p-3">{children}</div>
      <figcaption className="flex flex-wrap items-center gap-2 p-3">
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-[11.5px] text-ink-3">{spec}</span>
        <span className="flex-1" />
        {file && (
          <a href={assetUrl(file)} download className="rounded-md border border-line px-2 py-1 text-[11.5px] hover:border-line-strong">
            PNG
          </a>
        )}
      </figcaption>
    </figure>
  )
}
