/* Geometry of the 4:3 presentation stage (2048 × 1536 design units). */
export const W = 2048
export const H = 1536
export const NAVY = '#0D082E'
export const INK = '#0F0A13'
export const WHITE = '#FFFFFF'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}
export interface Slot extends Box {
  side: 'top' | 'bottom' | 'left' | 'right'
}

const TOP = 128
const BOTTOM = 1408
const GAP = 44
const SIDE_W = 570

/** Asymmetric radial layout, clockwise from the top. */
export function layout(n: number): { centre: Box; slots: Slot[] } {
  const leftX = GAP
  const rightX = W - GAP - SIDE_W
  const colX = leftX + SIDE_W + GAP
  const colW = rightX - GAP - colX
  if (n === 6) {
    const ch = 264
    const cy = (TOP + BOTTOM) / 2 - ch / 2
    const tbH = cy - GAP - TOP
    const sideH = (BOTTOM - TOP - 40) / 2
    const centre = { x: colX, y: cy, w: colW, h: ch }
    return {
      centre,
      slots: [
        { side: 'top', x: colX, y: TOP, w: colW, h: tbH },
        { side: 'right', x: rightX, y: TOP, w: SIDE_W, h: sideH },
        { side: 'right', x: rightX, y: TOP + sideH + 40, w: SIDE_W, h: sideH },
        { side: 'bottom', x: colX, y: cy + ch + GAP, w: colW, h: tbH },
        { side: 'left', x: leftX, y: TOP + sideH + 40, w: SIDE_W, h: sideH },
        { side: 'left', x: leftX, y: TOP, w: SIDE_W, h: sideH },
      ],
    }
  }
  // Generic: right column top → bottom, then left column bottom → top (clockwise).
  const right = Math.ceil(n / 2)
  const left = n - right
  const col = (count: number, x: number, side: 'left' | 'right'): Slot[] => {
    if (!count) return []
    const h = (BOTTOM - TOP - 32 * (count - 1)) / count
    return Array.from({ length: count }, (_, i) => ({ side, x, y: TOP + i * (h + 32), w: SIDE_W, h }))
  }
  const ch = 420
  return {
    centre: { x: colX - 20, y: (TOP + BOTTOM) / 2 - ch / 2, w: colW + 40, h: ch },
    slots: [...col(right, rightX, 'right'), ...col(left, leftX, 'left').reverse()],
  }
}

/** Connector path from the centre node to a branch slot. */
export function connector(c: Box, s: Slot): string {
  const cx = c.x + c.w / 2
  const cy = c.y + c.h / 2
  if (s.side === 'top') return `M${cx},${c.y} L${cx},${s.y + s.h}`
  if (s.side === 'bottom') return `M${cx},${c.y + c.h} L${cx},${s.y}`
  const sy = s.y + s.h / 2
  const x0 = s.side === 'left' ? c.x : c.x + c.w
  const x1 = s.side === 'left' ? s.x + s.w : s.x
  const y0 = Math.max(c.y + 40, Math.min(c.y + c.h - 40, sy))
  const mx = (x0 + x1) / 2
  return `M${x0},${y0 === sy ? sy : cy + (sy - cy) * 0.35} C${mx},${y0 === sy ? sy : cy + (sy - cy) * 0.35} ${mx},${sy} ${x1},${sy}`
}

export const logoUrl = `${import.meta.env.BASE_URL}brand/fynovates-wordmark-white.png`
export const logoSignatureUrl = `${import.meta.env.BASE_URL}brand/fynovates-wordmark-signature-white.png`
