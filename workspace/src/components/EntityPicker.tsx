import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Dialog } from './ui'

export interface PickItem {
  id: string
  label: string
  meta?: string
}

export function EntityPicker({
  open,
  onClose,
  items,
  selected,
  onChange,
  title,
  single,
}: {
  open: boolean
  onClose: () => void
  items: PickItem[]
  selected: string[]
  onChange: (ids: string[]) => void
  title: string
  single?: boolean
}) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string[]>(selected)
  const [lastOpen, setLastOpen] = useState(false)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setSel(selected)
      setQ('')
    }
  }
  const list = useMemo(() => {
    const s = q.toLowerCase()
    return items.filter((i) => !s || `${i.id} ${i.label} ${i.meta ?? ''}`.toLowerCase().includes(s))
  }, [items, q])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-[640px]"
      footer={
        <>
          <span className="mr-auto self-center text-[12px] text-ink-3">{sel.length} sélectionné(s)</span>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            onClick={() => {
              onChange(sel)
              onClose()
            }}
          >
            Valider
          </Button>
        </>
      }
    >
      <input className="input mb-3" autoFocus placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="divide-y divide-line rounded-lg border border-line">
        {list.length === 0 && <div className="px-3 py-6 text-center text-[12.5px] text-ink-3">Aucun élément.</div>}
        {list.map((it) => {
          const on = sel.includes(it.id)
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setSel(single ? (on ? [] : [it.id]) : on ? sel.filter((x) => x !== it.id) : [...sel, it.id])}
              className={clsx('flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-surface-2', on && 'bg-surface-2')}
            >
              <span className={clsx('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-ink bg-ink text-bg' : 'border-line-strong')}>
                {on && <Check size={11} />}
              </span>
              <span className="w-[62px] shrink-0 font-mono text-[11px] text-ink-3">{it.id}</span>
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.meta && <span className="shrink-0 text-[11px] text-ink-3">{it.meta}</span>}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}
