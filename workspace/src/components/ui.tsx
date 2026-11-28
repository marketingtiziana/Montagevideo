import clsx from 'clsx'
import { X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { BRANDS, PILLARS, PLATFORMS, STAGE_LABEL, TBD, VALIDATION_TONE } from '../lib/constants'
import type { BrandId, PillarId, PlatformId, Stage, Validation } from '../lib/types'

/* ---------------- Buttons ---------------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  icon?: ReactNode
}
export function Button({ variant = 'secondary', size = 'md', icon, className, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-[7px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap select-none',
        size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13px]',
        variant === 'primary' && 'bg-ink text-bg hover:opacity-90',
        variant === 'secondary' && 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2',
        variant === 'ghost' && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        variant === 'danger' && 'text-[var(--v-expert)] hover:bg-[color-mix(in_srgb,var(--v-expert)_10%,transparent)]',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={clsx(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ---------------- Badges & chips ---------------- */

export function Dot({ color, className }: { color: string; className?: string }) {
  return <span className={clsx('inline-block h-1.5 w-1.5 shrink-0 rounded-full', className)} style={{ background: color }} />
}

export function ValidationBadge({ value, className }: { value: Validation; className?: string }) {
  const tone = VALIDATION_TONE[value]
  const c = `var(--v-${tone})`
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded px-1.5 py-[1px] text-[10px] font-semibold tracking-[0.04em] whitespace-nowrap', className)}
      style={{ color: c, background: `color-mix(in srgb, ${c} 10%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 22%, transparent)` }}
    >
      {value}
    </span>
  )
}

export function BrandChip({ id, compact }: { id: BrandId; compact?: boolean }) {
  const b = BRANDS[id]
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 whitespace-nowrap">
      <span className="h-2.5 w-[3px] rounded-full" style={{ background: b.color }} />
      {compact ? b.short : b.label}
    </span>
  )
}

export function PlatformChip({ id, compact }: { id: PlatformId; compact?: boolean }) {
  const p = PLATFORMS[id]
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-[1px] text-[11px] text-ink-2 whitespace-nowrap"
      title={p.label}
    >
      <Dot color={p.color} />
      {compact ? `${p.short}·${p.brand}` : p.label}
    </span>
  )
}

export function PillarChip({ id, full }: { id: PillarId; full?: boolean }) {
  const p = PILLARS[id]
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 whitespace-nowrap" title={p.label}>
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
        style={{ background: p.color }}
      >
        {id}
      </span>
      {full ? p.label : p.short}
    </span>
  )
}

export function StageBadge({ id }: { id: Stage }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-[1px] text-[11px] text-ink-2 whitespace-nowrap">
      {STAGE_LABEL[id]}
    </span>
  )
}

export function Tbd({ value, className }: { value?: string | null; className?: string }) {
  if (value && value.trim() && value !== TBD) return <span className={className}>{value}</span>
  return <span className={clsx('text-[11px] font-semibold tracking-[0.06em] text-ink-3', className)}>{TBD}</span>
}

/* ---------------- Form fields ---------------- */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-medium text-ink-2">{label}</span>
        {hint}
      </span>
      {children}
    </label>
  )
}

/** Text input that commits on blur / Enter (avoids a DB write per keystroke). */
export function TextInput({
  value,
  onCommit,
  placeholder = 'À RENSEIGNER',
  className,
  autoFocus,
}: {
  value: string
  onCommit: (v: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  return (
    <input
      className={clsx('input', className)}
      value={v}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') {
          setV(value)
          ;(e.target as HTMLInputElement).blur()
        }
      }}
    />
  )
}

export function TextArea({
  value,
  onCommit,
  placeholder = 'À RENSEIGNER',
  rows = 3,
  className,
}: {
  value: string
  onCommit: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  const [v, setV] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => setV(value), [value])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight + 2, rows * 22)}px`
  }, [v, rows])
  return (
    <textarea
      ref={ref}
      className={clsx('input', className)}
      value={v}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
    />
  )
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  className,
  allowEmpty,
  emptyLabel = 'À RENSEIGNER',
}: {
  value: T | null | ''
  options: { value: T; label: string }[]
  onChange: (v: T | null) => void
  className?: string
  allowEmpty?: boolean
  emptyLabel?: string
}) {
  return (
    <select
      className={clsx('input appearance-none !pr-7', className)}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '12px',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%2385858c' stroke-width='1.5'%3E%3Cpath d='M3 4.5l3 3 3-3'/%3E%3C/svg%3E\")",
      }}
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || null) as T | null)}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function ToggleChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T[]
  options: { value: T; label: string; color?: string }[]
  onChange: (v: T[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[12px] transition-colors',
              on ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink-2 hover:border-line-strong',
            )}
          >
            {o.color && <Dot color={on ? 'currentColor' : o.color} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Overlays ---------------- */

function useEscape(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, active])
}

export function Sheet({
  open,
  onClose,
  children,
  width = 'max-w-[880px]',
  label,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: string
  label: string
}) {
  useEscape(onClose, open)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-label={label} aria-modal="true">
      <div className="fade-in absolute inset-0 bg-[rgb(17_17_20/0.18)]" onClick={onClose} />
      <div
        className={clsx(
          'slide-in relative flex h-full w-full flex-col border-l border-line bg-bg shadow-[var(--shadow-lg)]',
          width,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-[520px]',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}) {
  useEscape(onClose, open)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade-in absolute inset-0 bg-[rgb(17_17_20/0.28)]" onClick={onClose} />
      <div className={clsx('fade-in relative w-full rounded-xl border border-line bg-surface shadow-[var(--shadow-lg)]', width)}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          <IconButton label="Fermer" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 scroll-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[13px] text-ink-2">{message}</div>
    </Dialog>
  )
}

/* ---------------- Tabs ---------------- */

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; count?: number }[]
  className?: string
}) {
  return (
    <div role="tablist" className={clsx('flex gap-0.5 overflow-x-auto scroll-thin', className)}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          type="button"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={clsx(
            'relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors',
            value === it.value ? 'bg-surface text-ink shadow-[var(--shadow)] ring-1 ring-line' : 'text-ink-3 hover:text-ink',
          )}
        >
          {it.label}
          {it.count !== undefined && <span className="ml-1.5 tabular text-ink-3">{it.count}</span>}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Layout helpers ---------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="min-w-0 max-w-[760px] flex-1">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="display text-[34px] leading-[1.05] text-ink md:text-[40px]">{title}</h1>
        {description && <div className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Section({
  title,
  aside,
  children,
  className,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={clsx('mb-8', className)}>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2">
        <h2 className="text-[13px] font-semibold tracking-[-0.005em] text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center',
        className,
      )}
    >
      <div className="text-[13.5px] font-medium text-ink">{title}</div>
      {description && <div className="mt-1 max-w-[420px] text-[12.5px] text-ink-3">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Loading() {
  return <div className="p-10 text-[13px] text-ink-3">Chargement…</div>
}

/* ---------------- Toasts ---------------- */

type Toast = { id: number; text: string; tone: 'ok' | 'error' }
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setList((l) => [...l, { id, text, tone }])
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        {list.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'fade-in pointer-events-auto rounded-lg px-3.5 py-2 text-[12.5px] shadow-[var(--shadow-lg)]',
              t.tone === 'ok' ? 'bg-ink text-bg' : 'bg-[var(--v-expert)] text-white',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
