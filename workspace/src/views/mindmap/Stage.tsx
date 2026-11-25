import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { connector, H, layout, logoUrl, W } from '../../lib/mindmap/layout'
import { type Branch, type Claim, type ClaimStatus, type MindMap, type MNode } from '../../lib/mindmap/types'

/* ------------------------------------------------------------------
   Presentation stage: a fixed 2048 × 1536 (4:3) canvas, scaled to fit
   and letterboxed, so the layout is identical on every iPad.
   ------------------------------------------------------------------ */

export function ScaledStage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className}`}>
      {scale > 0 && (
        <div
          className="mm-stage absolute"
          style={{ width: W, height: H, left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: '50% 50%' }}
          data-scale={scale}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/** Shrinks the font scale (--k) of its content until it fits its box. */
export function Fit({ children, className = '', style, min = 0.62, deps }: { children: ReactNode; className?: string; style?: CSSProperties; min?: number; deps: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [fontsTick, setFontsTick] = useState(0)
  useEffect(() => {
    let live = true
    document.fonts?.ready.then(() => live && setFontsTick((t) => t + 1))
    return () => {
      live = false
    }
  }, [])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let k = 1
    el.style.setProperty('--k', '1')
    while (k > min && el.scrollHeight > el.clientHeight + 1) {
      k = Math.round((k - 0.03) * 100) / 100
      el.style.setProperty('--k', String(k))
    }
    el.dataset.overflow = el.scrollHeight > el.clientHeight + 1 ? '1' : '0'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsTick, ...deps])
  return (
    <div ref={ref} className={`mm-fit ${className}`} style={style}>
      {children}
    </div>
  )
}

export const fs = (px: number) => `calc(var(--k, 1) * ${px}px)`

export function StatusTag({ status, large }: { status: ClaimStatus; large?: boolean }) {
  return (
    <span className={`mm-status mm-status-${status === 'VALIDATED' ? 'ok' : status === 'PENDING VALIDATION' ? 'pending' : 'research'}`} style={{ fontSize: large ? 22 : 18 }}>
      {status}
    </span>
  )
}

/* ---------------- overview ---------------- */

export function OverviewLayer({
  map,
  onBranch,
  onNode,
  onCentre,
  dim,
}: {
  map: MindMap
  onBranch?: (b: Branch) => void
  onNode?: (b: Branch, n: MNode) => void
  onCentre?: () => void
  dim?: string | null
}) {
  const { centre, slots } = layout(map.branches.length)
  return (
    <div className="absolute inset-0" data-mm-layer="overview">
      <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden>
        {map.branches.map((b, i) => slots[i] && <path key={b.id} d={connector(centre, slots[i])} className="mm-link" />)}
      </svg>
      <CentreNode map={map} box={centre} onTap={onCentre} />
      {map.branches.map((b, i) => {
        const s = slots[i]
        if (!s) return null
        return (
          <div
            key={b.id}
            role="button"
            tabIndex={0}
            data-branch={b.id}
            className={`mm-branch mm-anim ${dim && dim !== b.id ? 'mm-dim' : ''}`}
            style={{ left: s.x, top: s.y, width: s.w, height: s.h, animationDelay: `${i * 40}ms` }}
            onClick={() => onBranch?.(b)}
            onKeyDown={(e) => e.key === 'Enter' && onBranch?.(b)}
          >
            <Fit className="h-full" deps={[b, s.w, s.h]}>
              <div className="flex items-baseline gap-5">
                <span className="mm-num" style={{ fontSize: fs(22) }}>
                  {b.num}
                </span>
                <span className="mm-rule" />
              </div>
              <h3 className="mm-branch-title" style={{ fontSize: fs(33) }}>
                {b.title}
              </h3>
              <p className="mm-phrase" style={{ fontSize: fs(23) }}>
                {b.phrase}
              </p>
              <ul className="mm-nodes">
                {b.nodes.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      data-node={n.id}
                      className="mm-node"
                      style={{ fontSize: fs(23) }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onNode?.(b, n)
                      }}
                    >
                      {n.title}
                    </button>
                  </li>
                ))}
              </ul>
            </Fit>
          </div>
        )
      })}
    </div>
  )
}

function CentreNode({ map, box, onTap, compact }: { map: MindMap; box: { x: number; y: number; w: number; h: number }; onTap?: () => void; compact?: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      data-centre
      className="mm-centre mm-anim"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      onClick={onTap}
      onKeyDown={(e) => e.key === 'Enter' && onTap?.()}
    >
      <Fit className="flex h-full flex-col items-center justify-center text-center" deps={[map.title, map.subtitle, box.w, box.h, compact]}>
        <img src={logoUrl} alt="FYNOVATES" className="mm-logo" style={{ width: compact ? 220 : 300 }} draggable={false} />
        <span className="mm-centre-rule" />
        <h1 className="mm-centre-title" style={{ fontSize: fs(compact ? 30 : 38) }}>
          {map.title}
        </h1>
        {!compact && (
          <p className="mm-centre-sub" style={{ fontSize: fs(21) }}>
            {map.subtitle}
          </p>
        )}
      </Fit>
    </div>
  )
}

/* ---------------- focus ---------------- */

export function FocusLayer({
  map,
  branch,
  onBranch,
  onNode,
  onCentre,
}: {
  map: MindMap
  branch: Branch
  onBranch: (b: Branch) => void
  onNode: (b: Branch, n: MNode) => void
  onCentre: () => void
}) {
  const cols = branch.nodes.length > 4 ? 2 : 1
  return (
    <div className="absolute inset-0" data-mm-layer="focus">
      <CentreNode map={map} box={{ x: 48, y: 128, w: 560, h: 300 }} onTap={onCentre} compact />
      <nav className="absolute flex flex-col gap-3" style={{ left: 48, top: 468, width: 560 }} aria-label="Branches">
        {map.branches.map((b) => (
          <button
            key={b.id}
            type="button"
            data-rail={b.id}
            className={`mm-rail ${b.id === branch.id ? 'mm-rail-on' : ''}`}
            onClick={() => onBranch(b)}
          >
            <span className="mm-num" style={{ fontSize: 20 }}>
              {b.num}
            </span>
            <span style={{ fontSize: 22 }}>{b.title}</span>
          </button>
        ))}
      </nav>
      <section key={branch.id} className="mm-focus mm-anim" style={{ left: 656, top: 128, width: 1344, height: 1280 }} data-focus={branch.id}>
        <Fit className="flex h-full flex-col" deps={[branch]} min={0.7}>
          <div className="flex items-baseline gap-6">
            <span className="mm-num mm-num-dark" style={{ fontSize: fs(30) }}>
              {branch.num}
            </span>
            <span className="mm-rule mm-rule-dark" />
          </div>
          <h2 className="mm-focus-title" style={{ fontSize: fs(56) }}>
            {branch.title}
          </h2>
          <p className="mm-focus-phrase" style={{ fontSize: fs(30) }}>
            {branch.phrase}
          </p>
          <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {branch.nodes.map((n, i) => (
              <button key={n.id} type="button" data-node={n.id} className="mm-card mm-anim" style={{ animationDelay: `${60 + i * 30}ms` }} onClick={() => onNode(branch, n)}>
                <span className="mm-card-title" style={{ fontSize: fs(29) }}>
                  {n.title}
                </span>
                {n.detail && (
                  <span className="mm-card-detail" style={{ fontSize: fs(22) }}>
                    {n.detail}
                  </span>
                )}
              </button>
            ))}
          </div>
          {branch.notes.transition && (
            <p className="mm-transition" style={{ fontSize: fs(22) }}>
              → {branch.notes.transition}
            </p>
          )}
        </Fit>
      </section>
    </div>
  )
}

/* ---------------- node detail ---------------- */

export function NodeDetail({ map, branch, node, onClose }: { map: MindMap; branch: Branch; node: MNode; onClose: () => void }) {
  const claims = branch.claimIds.map((id) => map.claims.find((c) => c.id === id)).filter(Boolean) as Claim[]
  return (
    <div className="mm-scrim" onClick={onClose} data-detail>
      <div className="mm-detail mm-anim" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={node.title}>
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="mm-eyebrow">
              {branch.num} · {branch.title}
            </p>
            <h2 className="mt-4 text-[48px] font-semibold leading-tight">{node.title}</h2>
          </div>
          <button type="button" className="mm-btn shrink-0" onClick={onClose} aria-label="Fermer">
            Fermer
          </button>
        </div>
        {node.detail && <p className="mt-8 text-[30px] leading-snug text-white/85">{node.detail}</p>}
        {claims.length > 0 && (
          <div className="mt-10">
            <p className="mm-eyebrow">Points à vérifier avant de l’affirmer</p>
            <ul className="mt-5 space-y-4">
              {claims.map((c) => (
                <li key={c.id} className="mm-claim">
                  <StatusTag status={c.status} />
                  <span className="text-[22px] leading-snug text-white/80">
                    {c.text} <span className="text-white/50">— {c.reference || 'Référence à renseigner'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- presenter ---------------- */

export function PresenterLayer({ map, step, onStep }: { map: MindMap; step: number; onStep: (i: number) => void }) {
  const b = step > 0 ? map.branches[step - 1] : null
  return (
    <div className="absolute inset-0" data-mm-layer="presenter">
      <div key={step} className="mm-anim absolute" style={{ left: 64, top: 128, width: 1260, height: 1180 }}>
        {b ? <PresenterSection map={map} b={b} /> : <PresenterIntro map={map} />}
      </div>
      <aside className="absolute flex flex-col gap-6" style={{ left: 1372, top: 128, width: 612, height: 1180 }}>
        <MiniMap map={map} current={b?.id ?? null} onPick={(i) => onStep(i + 1)} />
        {b ? <PresenterSide map={map} b={b} /> : <PresenterPlan map={map} onStep={onStep} />}
      </aside>
    </div>
  )
}

function PresenterIntro({ map }: { map: MindMap }) {
  return (
    <Fit className="h-full" deps={[map]}>
      <img src={logoUrl} alt="FYNOVATES" style={{ width: 360 }} draggable={false} />
      <p className="mm-eyebrow mt-14">Carte {map.number} · Introduction</p>
      <h1 className="mt-6 font-semibold leading-[1.08] text-white" style={{ fontSize: fs(76) }}>
        {map.title}
      </h1>
      <p className="mt-8 text-white/75" style={{ fontSize: fs(36) }}>
        {map.subtitle}
      </p>
      <div className="mm-keyidea mt-14">
        <p className="mm-eyebrow">Objectif</p>
        <p className="mt-4 leading-snug" style={{ fontSize: fs(34) }}>
          {map.objective}
        </p>
      </div>
      <p className="mt-10 text-white/55" style={{ fontSize: fs(22) }}>
        {map.disclaimer}
      </p>
    </Fit>
  )
}

function PresenterSection({ map, b }: { map: MindMap; b: Branch }) {
  const n = b.notes
  return (
    <Fit className="h-full" deps={[b]} min={0.66}>
      <p className="mm-eyebrow" style={{ fontSize: fs(22) }}>
        Section {b.num} / {String(map.branches.length).padStart(2, '0')}
      </p>
      <h1 className="mt-4 font-semibold uppercase leading-[1.08] tracking-[0.04em] text-white" style={{ fontSize: fs(54) }}>
        {b.title}
      </h1>
      <p className="mt-4 text-white/70" style={{ fontSize: fs(30) }}>
        {b.phrase}
      </p>
      {n.mainIdea && (
        <div className="mm-keyidea mt-10">
          <p className="mm-eyebrow">Idée clé</p>
          <p className="mt-3 font-medium leading-snug" style={{ fontSize: fs(38) }}>
            {n.mainIdea}
          </p>
        </div>
      )}
      {n.points.length > 0 && (
        <div className="mt-10">
          <p className="mm-eyebrow">Points à développer</p>
          <ol className="mt-4 space-y-3">
            {n.points.map((p, i) => (
              <li key={i} className="flex gap-5 leading-snug text-white" style={{ fontSize: fs(31) }}>
                <span className="mm-num shrink-0" style={{ fontSize: fs(24), paddingTop: 6 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="mt-10 grid grid-cols-3 gap-6">
        {(
          [
            ['Explication', n.explanation],
            ['Exemple', n.example],
            ['Nuance', n.nuance],
          ] as const
        ).map(([k, v]) =>
          v ? (
            <div key={k} className="mm-cell">
              <p className="mm-eyebrow">{k}</p>
              <p className="mt-3 leading-snug text-white/85" style={{ fontSize: fs(22) }}>
                {v}
              </p>
            </div>
          ) : null,
        )}
      </div>
      {n.transition && (
        <p className="mt-10 text-white/70" style={{ fontSize: fs(26) }}>
          <span className="mm-eyebrow mr-4">Transition</span>
          {n.transition}
        </p>
      )}
    </Fit>
  )
}

function PresenterSide({ map, b }: { map: MindMap; b: Branch }) {
  const claims = b.claimIds.map((id) => map.claims.find((c) => c.id === id)).filter(Boolean) as Claim[]
  const validated = claims.filter((c) => c.status === 'VALIDATED')
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="mm-panel min-h-0 flex-1 overflow-y-auto">
        <p className="mm-eyebrow">Chiffres et affirmations vérifiés</p>
        {validated.length === 0 && <p className="mt-3 text-[21px] leading-snug text-white/70">Aucun chiffre validé : ne citer aucun taux, seuil ni délai.</p>}
        <ul className="mt-4 space-y-4">
          {claims.map((c) => (
            <li key={c.id} className="space-y-2">
              <StatusTag status={c.status} />
              <p className="text-[19px] leading-snug text-white/80">{c.text}</p>
              <p className="text-[17px] text-white/50">{c.reference}</p>
            </li>
          ))}
          {claims.length === 0 && <li className="text-[19px] text-white/55">Aucune affirmation technique dans cette section.</li>}
        </ul>
      </div>
      {b.privateNotes && (
        <div className="mm-panel mm-private" data-private>
          <p className="mm-eyebrow">Notes privées · jamais exportées</p>
          <p className="mt-3 text-[21px] leading-snug">{b.privateNotes}</p>
        </div>
      )}
      {b.notes.conclusion && (
        <div className="mm-panel mm-panel-light">
          <p className="mm-eyebrow mm-eyebrow-dark">Conclusion de section</p>
          <p className="mt-3 text-[24px] font-medium leading-snug">{b.notes.conclusion}</p>
        </div>
      )}
    </div>
  )
}

function PresenterPlan({ map, onStep }: { map: MindMap; onStep: (i: number) => void }) {
  return (
    <div className="mm-panel min-h-0 flex-1 overflow-y-auto">
      <p className="mm-eyebrow">Plan</p>
      <ol className="mt-4 space-y-3">
        {map.branches.map((b, i) => (
          <li key={b.id}>
            <button type="button" className="flex w-full gap-4 py-2 text-left text-[22px] leading-snug text-white/85" onClick={() => onStep(i + 1)}>
              <span className="mm-num" style={{ fontSize: 19, paddingTop: 3 }}>
                {b.num}
              </span>
              {b.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Schematic of the map (current section highlighted) — keeps the presenter oriented. */
function MiniMap({ map, current, onPick }: { map: MindMap; current: string | null; onPick: (i: number) => void }) {
  const k = 612 / W
  const { centre, slots } = layout(map.branches.length)
  return (
    <div className="mm-mini relative shrink-0" style={{ width: 612, height: H * k }}>
      <svg className="absolute inset-0" width={612} height={H * k} aria-hidden>
        <g transform={`scale(${k})`}>
          {slots.slice(0, map.branches.length).map((s, i) => (
            <path key={i} d={connector(centre, s)} className="mm-link" />
          ))}
          <rect x={centre.x} y={centre.y} width={centre.w} height={centre.h} rx={8} className="mm-mini-centre" />
        </g>
      </svg>
      {map.branches.map((b, i) => {
        const s = slots[i]
        if (!s) return null
        return (
          <button
            key={b.id}
            type="button"
            className={`mm-mini-box ${b.id === current ? 'mm-mini-on' : ''}`}
            style={{ left: s.x * k, top: s.y * k, width: s.w * k, height: s.h * k }}
            onClick={() => onPick(i)}
            aria-label={`Section ${b.num}`}
          >
            {b.num}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- camera (pinch / pan) ---------------- */

export interface Cam {
  s: number
  x: number
  y: number
}
const clampCam = (c: Cam): Cam => {
  const s = Math.min(4, Math.max(1, c.s))
  return { s, x: Math.min(0, Math.max(W - W * s, c.x)), y: Math.min(0, Math.max(H - H * s, c.y)) }
}

/** Pinch-zoom and drag-pan in stage units; taps still reach the elements. */
export function useCamera() {
  const [cam, setCam] = useState<Cam>({ s: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const start = useRef<{ cam: Cam; d: number; mid: { x: number; y: number }; p0: { x: number; y: number } } | null>(null)
  const dragged = useRef(false)
  const camRef = useRef(cam)
  camRef.current = cam

  const toStage = (el: HTMLElement, e: { clientX: number; clientY: number }) => {
    const r = el.getBoundingClientRect()
    const k = r.width / W
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }
  }
  const snapshot = (el: HTMLElement) => {
    const pts = [...pointers.current.values()]
    const mid = pts.length > 1 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0]
    const d = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
    void el
    start.current = { cam: camRef.current, d, mid, p0: mid }
  }

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      pointers.current.set(e.pointerId, toStage(e.currentTarget, e))
      if (pointers.current.size === 1) dragged.current = false
      snapshot(e.currentTarget)
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (!pointers.current.has(e.pointerId) || !start.current) return
      pointers.current.set(e.pointerId, toStage(e.currentTarget, e))
      const pts = [...pointers.current.values()]
      const st = start.current
      if (pts.length >= 2) {
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        const s = Math.min(4, Math.max(1, (st.cam.s * d) / (st.d || d)))
        const px = (st.mid.x - st.cam.x) / st.cam.s
        const py = (st.mid.y - st.cam.y) / st.cam.s
        dragged.current = true
        setCam(clampCam({ s, x: mid.x - px * s, y: mid.y - py * s }))
      } else {
        const p = pts[0]
        const dx = p.x - st.p0.x
        const dy = p.y - st.p0.y
        if (!dragged.current && Math.hypot(dx, dy) < 18) return
        if (st.cam.s <= 1.001) return // nothing to pan at 100 %
        dragged.current = true
        setCam(clampCam({ s: st.cam.s, x: st.cam.x + dx, y: st.cam.y + dy }))
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      pointers.current.delete(e.pointerId)
      if (pointers.current.size) snapshot(e.currentTarget)
      else start.current = null
    },
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
      pointers.current.delete(e.pointerId)
      start.current = null
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (dragged.current) {
        e.stopPropagation()
        e.preventDefault()
        dragged.current = false
      }
    },
    onWheel: (e: React.WheelEvent<HTMLElement>) => {
      const p = toStage(e.currentTarget, e)
      const c = camRef.current
      if (e.ctrlKey || e.metaKey) {
        const s = Math.min(4, Math.max(1, c.s * Math.exp(-e.deltaY / 200)))
        const px = (p.x - c.x) / c.s
        const py = (p.y - c.y) / c.s
        setCam(clampCam({ s, x: p.x - px * s, y: p.y - py * s }))
      } else if (c.s > 1) {
        const k = W / e.currentTarget.getBoundingClientRect().width
        setCam(clampCam({ s: c.s, x: c.x - e.deltaX * k, y: c.y - e.deltaY * k }))
      }
    },
  }
  const reset = useCallback(() => setCam({ s: 1, x: 0, y: 0 }), [])
  const zoomBy = useCallback((f: number) => {
    const c = camRef.current
    const s = Math.min(4, Math.max(1, c.s * f))
    const px = (W / 2 - c.x) / c.s
    const py = (H / 2 - c.y) / c.s
    setCam(clampCam({ s, x: W / 2 - px * s, y: H / 2 - py * s }))
  }, [])
  return { cam, handlers, reset, zoomBy }
}
