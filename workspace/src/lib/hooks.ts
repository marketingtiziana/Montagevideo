import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { db } from './db'
import type { Content, ImageAsset } from './types'

export const useContents = () => useLiveQuery(() => db.contents.toArray(), [], undefined)
export const useProblems = () => useLiveQuery(() => db.problems.toArray(), [], undefined)
export const useImages = () => useLiveQuery(() => db.images.toArray(), [], undefined)
export const useChannels = () => useLiveQuery(() => db.channels.toArray(), [], undefined)
export const useBrands = () => useLiveQuery(() => db.brands.toArray(), [], undefined)
export const usePillars = () => useLiveQuery(() => db.pillars.toArray(), [], undefined)
export const useJourneys = () => useLiveQuery(() => db.journeys.toArray(), [], undefined)
export const useMatrix = () => useLiveQuery(() => db.matrix.orderBy('order').toArray(), [], undefined)
export const useRules = () => useLiveQuery(() => db.rules.toArray(), [], undefined)

export const useContent = (id: string | null) =>
  useLiveQuery(() => (id ? db.contents.get(id) : undefined), [id])
export const useProblem = (id: string | null) =>
  useLiveQuery(() => (id ? db.problems.get(id) : undefined), [id])
export const useImage = (id: string | null) => useLiveQuery(() => (id ? db.images.get(id) : undefined), [id])

/** Resolves an image to a displayable URL (public file or stored blob). */
export function useImageUrl(img: ImageAsset | undefined | null): string | null {
  const [url, setUrl] = useState<string | null>(img?.src || null)
  useEffect(() => {
    if (!img) return setUrl(null)
    if (!img.hasBlob) return setUrl(img.src)
    let revoke: string | null = null
    let alive = true
    db.files.get(img.id).then((f) => {
      if (!alive || !f) return
      revoke = URL.createObjectURL(f.blob)
      setUrl(revoke)
    })
    return () => {
      alive = false
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [img?.id, img?.hasBlob, img?.src])
  return url
}

export function useById<T extends { id: string }>(list: T[] | undefined) {
  return useMemo(() => new Map((list ?? []).map((x) => [x.id, x])), [list])
}

/** Inverse relations, computed from the single source of truth. */
export function useImageUsage(contents: Content[] | undefined) {
  return useMemo(() => {
    const m = new Map<string, string[]>()
    for (const c of contents ?? []) for (const i of c.imageIds) m.set(i, [...(m.get(i) ?? []), c.id])
    return m
  }, [contents])
}

export function useProblemUsage(contents: Content[] | undefined) {
  return useMemo(() => {
    const m = new Map<string, string[]>()
    for (const c of contents ?? []) for (const p of c.problemIds) m.set(p, [...(m.get(p) ?? []), c.id])
    return m
  }, [contents])
}

export const isToClassify = (img: ImageAsset) => img.type === 'a-classer' || (!img.brand && !img.platform)
