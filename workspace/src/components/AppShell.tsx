import clsx from 'clsx'
import { ChevronRight, Menu, Plus, Search, Settings2, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { findNav, NAV } from '../lib/nav'
import { CommandPalette } from './CommandPalette'
import { ContentDetail } from './content/ContentDetail'
import { ImageDetail } from './images/ImageDetail'
import { ProblemDetail } from './problems/ProblemDetail'
import { QuickCreate } from './QuickCreate'
import { SettingsDialog } from './SettingsDialog'
import { Button, IconButton } from './ui'

export function AppShell({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState(false)
  const [create, setCreate] = useState(false)
  const [settings, setSettings] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const loc = useLocation()

  useEffect(() => setMobileNav(false), [loc.pathname])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearch((s) => !s)
      } else if (!typing && e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setCreate(true)
      } else if (!typing && e.key === '/') {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const here = findNav(loc.pathname)
  const isCanvas = loc.pathname === '/map' || loc.pathname === '/journeys'

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-[248px] shrink-0 flex-col border-r border-line bg-surface-2 transition-transform lg:static lg:translate-x-0',
          mobileNav ? 'translate-x-0 shadow-[var(--shadow-lg)]' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-line px-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold tracking-[0.28em] text-ink">FYNOVATES</div>
            <div className="truncate text-[10.5px] text-ink-3">Marketing &amp; Creative Intelligence</div>
          </div>
          <IconButton label="Fermer le menu" className="lg:hidden" onClick={() => setMobileNav(false)}>
            <X size={15} />
          </IconButton>
        </div>
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setSearch(true)}
            className="flex h-8 w-full items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-ink-3 hover:border-line-strong"
          >
            <Search size={13} />
            Rechercher
            <kbd className="ml-auto rounded border border-line px-1 text-[10px]">⌘K</kbd>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 scroll-thin" aria-label="Navigation principale">
          {NAV.map((g) => (
            <div key={g.label} className="mb-4">
              <div className="eyebrow px-2 pb-1.5">{g.label}</div>
              {g.items.map((it) => (
                <NavLink
                  key={it.path}
                  to={it.path}
                  end
                  className={({ isActive }) =>
                    clsx(
                      'flex h-[30px] items-center rounded-md px-2 text-[13px] transition-colors',
                      isActive ? 'bg-surface font-medium text-ink shadow-[var(--shadow)] ring-1 ring-line' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
                    )
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" icon={<Settings2 size={14} />} onClick={() => setSettings(true)}>
            Données &amp; sauvegarde
          </Button>
        </div>
      </aside>
      {mobileNav && <div className="fixed inset-0 z-20 bg-[rgb(17_17_20/0.2)] lg:hidden" onClick={() => setMobileNav(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-bg/90 px-4 backdrop-blur md:px-6">
          <IconButton label="Ouvrir le menu" className="lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu size={16} />
          </IconButton>
          <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-ink-3">
            <span className="hidden sm:inline">Workspace</span>
            {here && (
              <>
                <ChevronRight size={12} className="hidden sm:inline" />
                <span className="hidden sm:inline">{here.group.label}</span>
                <ChevronRight size={12} className="hidden sm:inline" />
                <span className="truncate font-medium text-ink">{here.item.label}</span>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Search size={14} />} onClick={() => setSearch(true)} className="sm:hidden" aria-label="Rechercher" />
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setCreate(true)}>
              Créer
              <kbd className="ml-1 hidden rounded border border-white/25 px-1 text-[10px] opacity-70 sm:inline">C</kbd>
            </Button>
          </div>
        </header>
        <main className={clsx('min-h-0 flex-1', isCanvas ? 'overflow-hidden' : 'overflow-y-auto scroll-thin')}>{children}</main>
      </div>

      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <QuickCreate open={create} onClose={() => setCreate(false)} />
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
      <ContentDetail />
      <ProblemDetail />
      <ImageDetail />
    </div>
  )
}

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={clsx('mx-auto w-full px-4 py-8 md:px-8', wide ? 'max-w-[1480px]' : 'max-w-[1240px]')}>{children}</div>
}
