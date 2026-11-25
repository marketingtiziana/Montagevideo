import { useMemo } from 'react'
import { brands, pillars } from './seed/brands'
import { channels } from './seed/channels'
import { contents as rawContents } from './seed/contents'
import { images } from './seed/images'
import { problems } from './seed/problems'
import { journeys, matrix, rules } from './seed/strategy'
import type { Content, ImageAsset } from './types'

/** Make relatedIds symmetric and drop dangling references. */
function normalize(list: Content[]): Content[] {
  const ids = new Set(list.map((c) => c.id))
  const map = new Map(list.map((c) => [c.id, new Set(c.relatedIds.filter((r) => ids.has(r) && r !== c.id))]))
  for (const [id, rel] of map) for (const r of rel) map.get(r)!.add(id)
  return list.map((c) => ({ ...c, relatedIds: [...map.get(c.id)!].sort() }))
}

const contents = normalize(rawContents)

/* Static reference data — the workspace is a read-only guide. */
export const DATA = { contents, problems, images, channels, brands, pillars, journeys, matrix, rules }

export const useContents = () => contents
export const useProblems = () => problems
export const useImages = () => images
export const useChannels = () => channels
export const useBrands = () => brands
export const usePillars = () => pillars
export const useJourneys = () => journeys
export const useMatrix = () => matrix
export const useRules = () => rules

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]))
const contentMap = byId(contents)
const problemMap = byId(problems)
const imageMap = byId(images)

export const useContent = (id: string | null) => (id ? contentMap.get(id) : undefined)
export const useProblem = (id: string | null) => (id ? problemMap.get(id) : undefined)
export const useImage = (id: string | null) => (id ? imageMap.get(id) : undefined)
export const getImage = (id: string | null | undefined) => (id ? imageMap.get(id) : undefined)
export const getContent = (id: string | null | undefined) => (id ? contentMap.get(id) : undefined)
export const getProblem = (id: string | null | undefined) => (id ? problemMap.get(id) : undefined)

export function useImageUrl(img: ImageAsset | undefined | null): string | null {
  return img?.src || null
}

export function useById<T extends { id: string }>(list: T[] | undefined) {
  return useMemo(() => new Map((list ?? []).map((x) => [x.id, x])), [list])
}

export function useImageUsage(list: Content[] | undefined) {
  return useMemo(() => {
    const m = new Map<string, string[]>()
    for (const c of list ?? []) for (const i of c.imageIds) m.set(i, [...(m.get(i) ?? []), c.id])
    return m
  }, [list])
}

export const isToClassify = (img: ImageAsset) => img.type === 'a-classer' || (!img.brand && !img.platform)
