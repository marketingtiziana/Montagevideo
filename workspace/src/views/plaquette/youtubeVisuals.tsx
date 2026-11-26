import type { ReactNode } from 'react'
import { NAVY, photo, Wordmark } from './kit'
import type { Motif, YtShort, YtTexts, YtVideo } from '../../lib/seed/youtubeFn'

/* Native-size YouTube visuals (exported as PNG by scripts/export-plaquettes.cjs). */

export const YT_THUMB = { w: 1280, h: 720 }
export const YT_SHORT = { w: 1080, h: 1920 }
export const YT_BANNER = { w: 2560, h: 1440 }
export const YT_AVATAR = { w: 800, h: 800 }

const FONT = 'Inter Variable, Inter, sans-serif'
const line = (dark: boolean, a = 0.22) => (dark ? `rgba(255,255,255,${a})` : `rgba(13,8,46,${a})`)

function Motifs({ motif, dark }: { motif: Motif; dark: boolean }) {
  const stroke = line(dark, 0.55)
  const fill = dark ? 'rgba(255,255,255,0.08)' : 'rgba(13,8,46,0.05)'
  const box = (x: number, y: number, w: number, h: number, label?: string, strong?: boolean) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} fill={strong ? (dark ? '#fff' : NAVY) : fill} stroke={stroke} strokeWidth={2} />
      {label && (
        <text x={x + 22} y={y + h / 2 + 9} fontSize={26} fontWeight={600} fontFamily={FONT} letterSpacing={3} fill={strong ? (dark ? NAVY : '#fff') : dark ? 'rgba(255,255,255,0.75)' : 'rgba(13,8,46,0.7)'}>
          {label}
        </text>
      )}
    </g>
  )
  const ln = (x1: number, y1: number, x2: number, y2: number) => <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2} />
  let g: ReactNode = null
  if (motif === 'list') g = [0, 1, 2].map((i) => box(20, 40 + i * 120, 380, 84, `0${i + 1}`, i === 0))
  if (motif === 'compare') g = [box(20, 40, 180, 340, 'A', true), box(220, 40, 180, 340, 'B'), ln(20, 420, 400, 420)]
  if (motif === 'flow') g = [box(20, 60, 150, 90, '01', true), ln(170, 105, 250, 105), box(250, 60, 150, 90, '02'), ln(325, 150, 325, 230), box(250, 230, 150, 90, '03'), ln(250, 275, 170, 275), box(20, 230, 150, 90, '04')]
  if (motif === 'tree') g = [box(140, 30, 140, 80, '', true), ln(210, 110, 210, 170), ln(60, 170, 360, 170), ...[0, 1, 2].map((i) => [ln(60 + i * 150, 170, 60 + i * 150, 220), box(10 + i * 150, 220, 100, 80)]).flat(), ln(60, 300, 60, 350), box(10, 350, 100, 60)]
  if (motif === 'grid') g = [0, 1, 2, 3].map((i) => box(20 + (i % 2) * 200, 40 + Math.floor(i / 2) * 200, 180, 180, `0${i + 1}`, i === 3))
  if (motif === 'steps') g = [0, 1, 2, 3].map((i) => box(20 + i * 95, 340 - i * 90, 95, 80 + i * 90, '', i === 3))
  return (
    <svg width={420} height={440} viewBox="0 0 420 440">
      {g}
    </svg>
  )
}

/** YouTube thumbnail, 1280 × 720. Photo = Format A (Tiziana), graphic = Format B (pédagogie). */
export function YtThumb({ v }: { v: YtVideo }) {
  const dark = v.style === 'photo' || v.tone !== 'white'
  const fg = dark ? '#fff' : NAVY
  return (
    <div data-asset={`yt-thumb-${v.id}`} style={{ width: 1280, height: 720, position: 'relative', overflow: 'hidden', background: dark ? NAVY : '#fff', color: fg, fontFamily: FONT }}>
      {v.style === 'photo' && v.photo && (
        <>
          <img src={photo(v.photo)} alt="" style={{ position: 'absolute', right: 0, top: 0, width: 540, height: 720, objectFit: 'cover', objectPosition: 'center top' }} />
          <div style={{ position: 'absolute', left: 740, top: 0, bottom: 0, width: 3, background: '#fff' }} />
        </>
      )}
      {v.style === 'graphic' && v.motif && (
        <div style={{ position: 'absolute', right: 70, top: 150 }}>
          <Motifs motif={v.motif} dark={dark} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 72, top: 64, right: v.style === 'photo' ? 580 : 520, bottom: 64, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Wordmark width={200} tone={dark ? 'white' : 'navy'} />
          <span style={{ width: 2, height: 22, background: line(dark, 0.4) }} />
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: line(dark, 0.75) }}>{v.category}</span>
        </div>
        <div style={{ marginTop: 'auto', fontSize: v.big.length > 22 ? 74 : 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{v.big}</div>
        <div style={{ marginTop: 26, width: 72, height: 4, background: fg }} />
        <div style={{ marginTop: 24, fontSize: 34, fontWeight: 500, lineHeight: 1.2, color: line(dark, 0.85) }}>{v.small}</div>
      </div>
    </div>
  )
}

/** Vertical Short cover, 1080 × 1920. Key content kept out of the bottom UI area. */
export function YtShortThumb({ s }: { s: YtShort }) {
  const dark = s.style === 'photo' || s.tone !== 'white'
  return (
    <div data-asset={`yt-short-${s.id}`} style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden', background: dark ? NAVY : '#fff', color: dark ? '#fff' : NAVY, fontFamily: FONT }}>
      {s.style === 'photo' && s.photo && <img src={photo(s.photo)} alt="" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1440, objectFit: 'cover', objectPosition: 'center top' }} />}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 120, display: 'flex', justifyContent: 'center' }}>
        {s.style === 'graphic' && <Wordmark width={420} tone={dark ? 'white' : 'navy'} />}
      </div>
      <div
        style={{
          position: 'absolute',
          left: s.style === 'photo' ? 0 : 90,
          right: s.style === 'photo' ? 0 : 90,
          top: s.style === 'photo' ? 1180 : 640,
          padding: s.style === 'photo' ? '70px 90px' : 0,
          background: s.style === 'photo' ? NAVY : undefined,
          textAlign: s.style === 'photo' ? 'left' : 'center',
        }}
      >
        {s.style === 'photo' && <Wordmark width={300} style={{ marginBottom: 44 }} />}
        <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{s.big}</div>
        <div style={{ marginTop: 40, height: 5, width: 96, background: dark ? '#fff' : NAVY, marginInline: s.style === 'photo' ? undefined : 'auto' }} />
      </div>
      {s.style === 'graphic' && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: 1060, display: 'grid', gap: 22 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 96, border: `3px solid ${line(dark, 0.35)}`, background: i === 0 ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(13,8,46,0.05)') : undefined, display: 'flex', alignItems: 'center', paddingLeft: 34, fontSize: 34, fontWeight: 600, letterSpacing: '0.14em', color: line(dark, 0.7) }}>
              0{i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Channel banner, 2560 × 1440. Everything important stays inside the 1546 × 423 safe area. */
export function YtBanner({ t, safe }: { t: YtTexts; safe?: boolean }) {
  const domains = t.banner.domains.split('•').map((s) => s.trim()).filter(Boolean)
  return (
    <div data-asset="yt-banner" style={{ width: 2560, height: 1440, position: 'relative', overflow: 'hidden', background: NAVY, color: '#fff', fontFamily: FONT }}>
      {[507, 2053].map((x) => (
        <div key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: x, width: 2, background: 'rgba(255,255,255,0.08)' }} />
      ))}
      {[508, 931].map((y) => (
        <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: y, height: 2, background: 'rgba(255,255,255,0.08)' }} />
      ))}
      <div style={{ position: 'absolute', left: 507, top: 508, width: 1546, height: 423, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Wordmark width={620} />
        <div style={{ marginTop: 44, fontSize: 42, fontWeight: 500, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>{t.banner.message}</div>
        <div style={{ marginTop: 30, display: 'flex', gap: 30, alignItems: 'center', fontSize: 24, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>
          {domains.map((d, i) => (
            <span key={d} style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              {i > 0 && <span style={{ width: 8, height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.45)' }} />}
              {d}
            </span>
          ))}
        </div>
      </div>
      {safe && (
        <>
          <Zone x={0} y={508} w={2560} h={423} label="Ordinateur — 2560 × 423" />
          <Zone x={507} y={508} w={1546} h={423} label="Zone de sécurité (mobile) — 1546 × 423" strong />
          <Zone x={0} y={0} w={2560} h={1440} label="Télévision — 2560 × 1440" />
        </>
      )}
    </div>
  )
}

function Zone({ x, y, w, h, label, strong }: { x: number; y: number; w: number; h: number; label: string; strong?: boolean }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `${strong ? 6 : 4}px dashed ${strong ? '#fff' : 'rgba(255,255,255,0.5)'}`, boxSizing: 'border-box' }}>
      <span style={{ position: 'absolute', left: 16, top: 12, fontSize: 30, fontWeight: 600, background: 'rgba(15,10,19,0.75)', padding: '4px 12px' }}>{label}</span>
    </div>
  )
}

export function YtAvatar() {
  return (
    <div data-asset="yt-avatar" style={{ width: 800, height: 800, borderRadius: 800, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Wordmark width={600} />
    </div>
  )
}

/** End screen, 1280 × 720: next video + appointment block. */
export function YtEndScreen({ t, next }: { t: YtTexts; next: YtVideo }) {
  return (
    <div data-asset="yt-endscreen" style={{ width: 1280, height: 720, background: NAVY, color: '#fff', fontFamily: FONT, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 80, top: 70 }}>
        <Wordmark width={220} />
      </div>
      <div style={{ position: 'absolute', left: 80, top: 200, width: 560 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.2em', opacity: 0.7, marginBottom: 16 }}>VIDÉO SUIVANTE</div>
        <div style={{ width: 560, height: 315, overflow: 'hidden', border: '3px solid #fff' }}>
          <div style={{ transform: `scale(${560 / 1280})`, transformOrigin: 'top left' }}>
            <YtThumb v={next} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 700, top: 200, width: 500 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.2em', opacity: 0.7, marginBottom: 16 }}>ÉCHANGER AVEC LE CABINET</div>
        <div style={{ background: '#fff', color: NAVY, padding: '34px 36px', height: 315, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>Prendre rendez-vous</div>
          <div style={{ marginTop: 16, fontSize: 24, lineHeight: 1.35, opacity: 0.75 }}>Une situation qui demande une analyse personnalisée</div>
          <div style={{ marginTop: 'auto', fontSize: 30, fontWeight: 600 }}>{t.website}</div>
        </div>
      </div>
    </div>
  )
}
