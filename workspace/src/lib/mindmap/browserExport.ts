import { download } from '../brand/store'
import { buildNotesMd, buildSourcesMd, buildSvg } from './exporters'
import { H, logoUrl, W } from './layout'
import { publicCopy, type MindMap } from './types'

let logoCache: string | null = null
export async function logoDataUrl(): Promise<string> {
  if (logoCache) return logoCache
  const blob = await (await fetch(logoUrl)).blob()
  logoCache = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(blob)
  })
  return logoCache
}

export async function standaloneSvg(map: MindMap) {
  return buildSvg(publicCopy(map), await logoDataUrl())
}

export async function downloadSvg(map: MindMap) {
  download(`${map.slug}-mindmap.svg`, await standaloneSvg(map), 'image/svg+xml')
}

export async function downloadPng(map: MindMap) {
  const svg = await standaloneSvg(map)
  const img = new Image()
  img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  await img.decode()
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  c.getContext('2d')!.drawImage(img, 0, 0, W, H)
  URL.revokeObjectURL(img.src)
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${map.slug}-overview.png`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export const downloadJson = (map: MindMap) => download(`${map.slug}-mindmap.json`, JSON.stringify(publicCopy(map), null, 2), 'application/json')
export const downloadNotes = (map: MindMap) => download(`${map.slug}-speaker_notes.md`, buildNotesMd(publicCopy(map)))
export const downloadSources = (map: MindMap) => download(`${map.slug}-sources.md`, buildSourcesMd(map))
