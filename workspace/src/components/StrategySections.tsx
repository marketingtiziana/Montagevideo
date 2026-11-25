import clsx from 'clsx'
import { Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { newKey } from '../lib/actions'
import { VALIDATIONS } from '../lib/constants'
import type { StrategySection, Validation } from '../lib/types'
import { IconButton, Select, TextInput, ValidationBadge } from './ui'

/** Editable strategic lists. `onChange` receives the full new sections array. */
export function StrategySections({
  sections,
  onChange,
  columns = 2,
}: {
  sections: StrategySection[]
  onChange: (s: StrategySection[]) => void
  columns?: 1 | 2 | 3
}) {
  const setSection = (i: number, s: StrategySection) => onChange(sections.map((x, j) => (j === i ? s : x)))
  return (
    <div className={clsx('grid gap-4', columns === 2 && 'md:grid-cols-2', columns === 3 && 'md:grid-cols-2 xl:grid-cols-3')}>
      {sections.map((s, i) => (
        <SectionCard key={s.id} s={s} onChange={(n) => setSection(i, n)} />
      ))}
    </div>
  )
}

function SectionCard({ s, onChange }: { s: StrategySection; onChange: (s: StrategySection) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const isRules = s.kind === 'rules'
  return (
    <div className={clsx('rounded-xl border bg-surface p-4', isRules ? 'border-[color-mix(in_srgb,var(--v-expert)_28%,var(--line))]' : 'border-line')}>
      <div className="mb-2.5 flex items-center gap-2">
        {isRules && <ShieldAlert size={14} className="text-[var(--v-expert)]" />}
        <h3 className="text-[12.5px] font-semibold">{s.title}</h3>
        {isRules && <span className="text-[10px] font-semibold tracking-[0.08em] text-[var(--v-expert)]">CONTRAINTE</span>}
        <span className="ml-auto text-[11px] tabular text-ink-3">{s.items.length}</span>
      </div>
      <ul className="space-y-0.5">
        {s.items.map((it, idx) => (
          <li key={it.id} className="group">
            {editing === it.id ? (
              <div className="space-y-1.5 rounded-md bg-surface-2 p-2">
                <TextInput
                  autoFocus
                  value={it.text}
                  onCommit={(v) => onChange({ ...s, items: s.items.map((x) => (x.id === it.id ? { ...x, text: v } : x)) })}
                />
                <div className="flex items-center gap-2">
                  <Select<Validation>
                    className="!h-7 !py-0 text-[12px]"
                    value={it.validation}
                    onChange={(v) => v && onChange({ ...s, items: s.items.map((x) => (x.id === it.id ? { ...x, validation: v } : x)) })}
                    options={VALIDATIONS.map((v) => ({ value: v, label: v }))}
                  />
                  <IconButton label="Supprimer" onClick={() => onChange({ ...s, items: s.items.filter((x) => x.id !== it.id) })}>
                    <Trash2 size={13} />
                  </IconButton>
                  <button type="button" className="ml-auto text-[12px] font-medium text-ink-2 hover:text-ink" onClick={() => setEditing(null)}>
                    Terminer
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(it.id)}
                className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left text-[12.5px] leading-relaxed hover:bg-surface-2"
                title="Modifier"
              >
                {s.kind === 'pillars' ? (
                  <span className="w-4 shrink-0 tabular text-ink-3">{idx + 1}</span>
                ) : (
                  <span className={clsx('mt-[7px] h-1 w-1 shrink-0 rounded-full', isRules ? 'bg-[var(--v-expert)]' : 'bg-ink-3')} />
                )}
                <span className="flex-1 text-ink">{it.text}</span>
                {it.validation !== 'VALIDÉ' && <ValidationBadge value={it.validation} className="mt-0.5" />}
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          const id = newKey()
          onChange({ ...s, items: [...s.items, { id, text: 'Nouvel élément', validation: 'IDÉE À VALIDER' }] })
          setEditing(id)
        }}
        className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-ink-3 hover:bg-surface-2 hover:text-ink"
      >
        <Plus size={12} /> Ajouter
      </button>
    </div>
  )
}
