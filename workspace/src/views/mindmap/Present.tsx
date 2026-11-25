import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { logoDataUrl } from '../../lib/mindmap/browserExport'
import { buildNotesMd, buildSourcesMd, buildSvg } from '../../lib/mindmap/exporters'
import { H, W } from '../../lib/mindmap/layout'
import { useMindmap, useMindmaps } from '../../lib/mindmap/store'
import { publicCopy, type Branch, type MNode } from '../../lib/mindmap/types'
import { FocusLayer, NodeDetail, OverviewLayer, PresenterLayer, ScaledStage, useCamera } from './Stage'
import './mindmap.css'

type Mode = 'overview' | 'focus' | 'presenter'

const lsGet = (k: string, d: string) => {
  try {
    return localStorage.getItem(k) ?? d
  } catch {
    return d
  }
}
const lsSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void }
const fsElement = () => document.fullscreenElement ?? (document as FsDoc).webkitFullscreenElement ?? null
const fsSupported = () => !!(document.documentElement.requestFullscreen || (document.documentElement as FsEl).webkitRequestFullscreen)

/* Touch controls fire on pointerup, so a tap right after a pinch / pan is never lost. */
let lastTap = 0
const tap = (fn: () => void) => ({
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' || e.currentTarget.disabled) return
    lastTap = Date.now()
    fn()
  },
  onClick: () => {
    if (Date.now() - lastTap > 700) fn()
  },
})

export default function Present() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const isExport = sp.get('export') === '1'
  const stored = useMindmap(id)
  const all = useMindmaps()
  const map = useMemo(() => (stored ? (isExport ? publicCopy(stored) : stored) : stored), [stored, isExport])

  const [mode, setMode] = useState<Mode>((sp.get('mode') as Mode) || 'overview')
  const [focusId, setFocusId] = useState<string | null>(sp.get('b'))
  const [step, setStep] = useState(Number(sp.get('step') ?? 0))
  const [detail, setDetail] = useState<{ b: Branch; n: MNode } | null>(null)
  const [chrome, setChrome] = useState(!isExport)
  const [anim, setAnim] = useState(() => !isExport && lsGet('mmAnim', matchMedia('(prefers-reduced-motion: reduce)').matches ? '0' : '1') === '1')
  const [isFs, setIsFs] = useState(false)
  const { cam, handlers, reset, zoomBy } = useCamera()

  useEffect(() => {
    const on = () => setIsFs(!!fsElement())
    document.addEventListener('fullscreenchange', on)
    document.addEventListener('webkitfullscreenchange', on)
    return () => {
      document.removeEventListener('fullscreenchange', on)
      document.removeEventListener('webkitfullscreenchange', on)
    }
  }, [])

  // Export hook for the scripted exporter (public data only: private notes stripped).
  useEffect(() => {
    if (!isExport || !map) return
    const w = window as unknown as { __MINDMAP__?: unknown }
    logoDataUrl().then((logo) => {
      w.__MINDMAP__ = { id: map.id, slug: map.slug, svg: buildSvg(map, logo), notes: buildNotesMd(map), sources: buildSourcesMd(map) }
    })
  }, [isExport, map])

  const branches = map?.branches ?? []
  const focusIdx = branches.findIndex((b) => b.id === focusId)
  const focusBranch = focusIdx >= 0 ? branches[focusIdx] : null

  const goOverview = useCallback(() => {
    setMode('overview')
    setFocusId(null)
    setDetail(null)
    reset()
  }, [reset])
  const focus = useCallback(
    (b: Branch) => {
      setMode('focus')
      setFocusId(b.id)
      setDetail(null)
      reset()
    },
    [reset],
  )

  const next = useCallback(() => {
    setDetail(null)
    if (mode === 'presenter') return setStep((s) => Math.min(branches.length, s + 1))
    if (mode === 'overview') return branches[0] && focus(branches[0])
    if (focusIdx < branches.length - 1) focus(branches[focusIdx + 1])
  }, [mode, branches, focusIdx, focus])
  const prev = useCallback(() => {
    setDetail(null)
    if (mode === 'presenter') return setStep((s) => Math.max(0, s - 1))
    if (mode === 'focus') return focusIdx > 0 ? focus(branches[focusIdx - 1]) : goOverview()
  }, [mode, branches, focusIdx, focus, goOverview])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') next()
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev()
      else if (e.key === 'Escape') detail ? setDetail(null) : goOverview()
      else if (e.key === 'h') setChrome((c) => !c)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goOverview, detail])

  const toggleFs = async () => {
    try {
      if (fsElement()) await (document.exitFullscreen?.() ?? (document as FsDoc).webkitExitFullscreen?.())
      else {
        const el = document.documentElement as FsEl
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
      }
    } catch {
      /* refused by the browser */
    }
  }
  const setModeSafe = (m: Mode) => {
    setDetail(null)
    reset()
    if (m === 'focus' && !focusBranch && branches[0]) return focus(branches[0])
    if (m === 'presenter') setStep(focusIdx >= 0 ? focusIdx + 1 : 0)
    setMode(m)
  }

  if (map === undefined) return <div className="mm-root" />
  if (map === null)
    return (
      <div className="mm-root flex items-center justify-center text-white">
        <p className="text-xl">
          Carte introuvable. <Link to="/mindmaps" className="underline">Retour au studio</Link>
        </p>
      </div>
    )

  const position = mode === 'presenter' ? `${step === 0 ? 'Intro' : String(step).padStart(2, '0')} / ${String(branches.length).padStart(2, '0')}` : mode === 'focus' ? `${focusBranch?.num ?? '—'} / ${String(branches.length).padStart(2, '0')}` : 'Vue d’ensemble'
  const canPrev = mode === 'presenter' ? step > 0 : mode === 'focus'
  const canNext = mode === 'presenter' ? step < branches.length : mode === 'overview' ? branches.length > 0 : focusIdx < branches.length - 1

  return (
    <div className={`mm-root ${anim ? '' : 'mm-noanim'}`} data-mode={mode} data-export={isExport ? '1' : undefined}>
      <ScaledStage>
        <div className="absolute inset-0 overflow-hidden" style={{ touchAction: 'none' }} {...(mode === 'presenter' ? {} : handlers)} data-viewport>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})` }} data-camera>
            {mode === 'overview' && <OverviewLayer map={map} onBranch={focus} onNode={(b, n) => setDetail({ b, n })} onCentre={goOverview} />}
            {mode === 'focus' && focusBranch && <FocusLayer map={map} branch={focusBranch} onBranch={focus} onNode={(b, n) => setDetail({ b, n })} onCentre={goOverview} />}
          </div>
          {mode === 'presenter' && <PresenterLayer map={map} step={step} onStep={setStep} />}
        </div>

        {detail && <NodeDetail map={map} branch={detail.b} node={detail.n} onClose={() => setDetail(null)} />}

        {chrome ? (
          <>
            <div className="mm-bar absolute flex items-center gap-4" style={{ left: 48, top: 32 }}>
              <button type="button" className="mm-btn" {...tap(() => nav('/mindmaps'))} aria-label="Quitter la présentation">
                ← Studio
              </button>
              <div className="mm-seg">
                {(all ?? []).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={m.id === map.id ? 'on' : ''}
                    {...tap(() => {
                      goOverview()
                      setStep(0)
                      nav(`/mindmaps/${m.id}/present`, { replace: true })
                    })}
                  >
                    Carte {m.number}
                  </button>
                ))}
              </div>
            </div>
            <div className="mm-bar absolute flex items-center gap-4" style={{ right: 48, top: 32 }}>
              <div className="mm-seg" role="tablist" aria-label="Mode">
                {(
                  [
                    ['overview', 'Vue d’ensemble'],
                    ['focus', 'Focus'],
                    ['presenter', 'Présentateur'],
                  ] as const
                ).map(([m, l]) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} {...tap(() => setModeSafe(m))}>
                    {l}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`mm-btn ${anim ? 'on' : ''}`}
                {...tap(() => {
                  setAnim((a) => !a)
                  lsSet('mmAnim', anim ? '0' : '1')
                })}
                aria-pressed={anim}
                title="Animations"
              >
                Animations
              </button>
              {fsSupported() && (
                <button type="button" className="mm-btn" {...tap(toggleFs)} aria-pressed={isFs}>
                  {isFs ? 'Quitter le plein écran' : 'Plein écran'}
                </button>
              )}
              <button type="button" className="mm-btn" {...tap(() => setChrome(false))} title="Masquer les contrôles (tournage)">
                Masquer
              </button>
            </div>
            <div className="mm-bar absolute flex items-center gap-4" style={{ left: '50%', bottom: 32, transform: 'translateX(-50%)' }}>
              <button type="button" className="mm-btn mm-btn-lg" {...tap(prev)} disabled={!canPrev} aria-label="Précédent">
                ‹ Précédent
              </button>
              <span className="mm-pos" data-position>
                {position}
              </span>
              <button type="button" className="mm-btn mm-btn-lg" {...tap(next)} disabled={!canNext} aria-label="Suivant">
                Suivant ›
              </button>
            </div>
            {mode !== 'presenter' && (
              <div className="mm-bar absolute flex items-center gap-3" style={{ right: 48, bottom: 32 }}>
                <button type="button" className="mm-btn" {...tap(() => zoomBy(1 / 1.4))} disabled={cam.s <= 1} aria-label="Dézoomer">
                  −
                </button>
                <button type="button" className="mm-btn" {...tap(() => zoomBy(1.4))} disabled={cam.s >= 4} aria-label="Zoomer">
                  +
                </button>
                <button type="button" className="mm-btn" {...tap(reset)} disabled={cam.s === 1} data-reset-zoom>
                  Réinitialiser
                </button>
              </div>
            )}
          </>
        ) : (
          !isExport && <button type="button" className="mm-hotcorner" {...tap(() => setChrome(true))} aria-label="Afficher les contrôles" />
        )}
      </ScaledStage>
    </div>
  )
}
