import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { FORMATS, IMAGE_TYPES, PILLARS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useContents, useImages, useProblems } from '../lib/hooks'
import { NAV } from '../lib/nav'

const itemCls =
  'flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-[13px] text-ink-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink'

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contents = useContents()
  const problems = useProblems()
  const images = useImages()
  const nav = useNavigate()
  const { open: openDetail } = useDetail()
  if (!open) return null

  const go = (fn: () => void) => {
    fn()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Recherche globale">
      <div className="fade-in absolute inset-0 bg-[rgb(17_17_20/0.28)]" onClick={onClose} />
      <Command
        label="Recherche globale"
        className="fade-in relative w-full max-w-[640px] overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-lg)]"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <Command.Input
          autoFocus
          placeholder="Rechercher un contenu, une problématique, une image, une vue…"
          className="h-12 w-full border-b border-line bg-transparent px-4 text-[14px] outline-none placeholder:text-ink-3"
        />
        <Command.List className="max-h-[56vh] overflow-y-auto p-2 scroll-thin">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-ink-3">Aucun résultat.</Command.Empty>
          <Command.Group heading="Vues" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5">
            {NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label }))).map((it) => (
              <Command.Item key={it.path} value={`vue ${it.label} ${it.group}`} className={itemCls} onSelect={() => go(() => nav(it.path))}>
                <span className="w-16 shrink-0 text-[11px] text-ink-3">{it.group}</span>
                {it.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Contenus" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5">
            {(contents ?? []).map((c) => (
              <Command.Item
                key={c.id}
                value={`${c.id} ${c.subject} ${c.hook} ${FORMATS[c.format]}`}
                className={itemCls}
                onSelect={() => go(() => openDetail('c', c.id))}
              >
                <span className="w-16 shrink-0 font-mono text-[11px] text-ink-3">{c.id}</span>
                <span className="truncate">{c.subject}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Problématiques" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5">
            {(problems ?? []).map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.id} ${p.title} ${p.situation} ${PILLARS[p.pillar].label}`}
                className={itemCls}
                onSelect={() => go(() => openDetail('p', p.id))}
              >
                <span className="w-16 shrink-0 font-mono text-[11px] text-ink-3">{p.id}</span>
                <span className="truncate">{p.title}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Images" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5">
            {(images ?? []).map((i) => (
              <Command.Item
                key={i.id}
                value={`${i.id} ${i.description} ${i.tags.join(' ')} ${IMAGE_TYPES[i.type]} ${i.originalName}`}
                className={itemCls}
                onSelect={() => go(() => openDetail('i', i.id))}
              >
                <span className="w-16 shrink-0 font-mono text-[11px] text-ink-3">{i.id}</span>
                <span className="truncate">{i.description || i.originalName}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
