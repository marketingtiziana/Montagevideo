import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IMAGE_TYPES } from '../../lib/constants'
import { useImages } from '../../lib/hooks'
import { Button, Dialog } from '../ui'
import { Thumb } from './Thumb'

export function ImagePicker({
  open,
  onClose,
  selected,
  onChange,
  single,
  title = 'Associer des références visuelles',
}: {
  open: boolean
  onClose: () => void
  selected: string[]
  onChange: (ids: string[]) => void
  single?: boolean
  title?: string
}) {
  const images = useImages()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string[]>(selected)
  const [lastOpen, setLastOpen] = useState(false)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setSel(selected)
  }
  const list = useMemo(() => {
    const s = q.toLowerCase()
    return (images ?? []).filter(
      (i) => !s || `${i.id} ${i.description} ${i.tags.join(' ')} ${IMAGE_TYPES[i.type]}`.toLowerCase().includes(s),
    )
  }, [images, q])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-[860px]"
      footer={
        <>
          <span className="mr-auto self-center text-[12px] text-ink-3">{sel.length} sélectionnée(s)</span>
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
      <input className="input mb-3" placeholder="Filtrer par identifiant, description, tag…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {list.map((img) => {
          const on = sel.includes(img.id)
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setSel(single ? (on ? [] : [img.id]) : on ? sel.filter((x) => x !== img.id) : [...sel, img.id])}
              className={clsx('group relative overflow-hidden rounded-lg border text-left', on ? 'border-ink ring-2 ring-ink' : 'border-line')}
            >
              <Thumb img={img} className="aspect-square w-full" />
              <div className="px-2 py-1.5">
                <div className="font-mono text-[10.5px] text-ink-3">{img.id}</div>
                <div className="truncate text-[11.5px] text-ink-2">{IMAGE_TYPES[img.type]}</div>
              </div>
              {on && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-bg">
                  <Check size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}
