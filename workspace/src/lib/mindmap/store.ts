import Dexie, { type EntityTable } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { identity } from '../brand/store'
import { seedMap, SEED_MAPS } from './data'
import type { MindMap } from './types'

/* Edited mind maps and their versions, stored locally (IndexedDB). The JSON files
   in /output/mindmaps are the original version; "Restaurer l'original" returns to them. */

export interface MapRow {
  id: string
  data: MindMap
  updatedAt: number
  updatedBy: string
}
export interface MapVersionRow {
  id?: number
  mapId: string
  data: MindMap
  label: string
  savedAt: number
  author: string
}

class MindmapDB extends Dexie {
  maps!: EntityTable<MapRow, 'id'>
  versions!: EntityTable<MapVersionRow, 'id'>
  constructor() {
    super('fynovates-mindmaps')
    this.version(1).stores({ maps: 'id', versions: '++id, mapId, savedAt' })
  }
}
export const mdb = new MindmapDB()

const who = () => identity.name() || 'Utilisateur local'
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

/** Current version of a map: the saved edit if any, else the original JSON. */
export function useMindmap(id: string | undefined): MindMap | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null
    const row = await mdb.maps.get(id)
    return row?.data ?? seedMap(id) ?? null
  }, [id])
}

export function useMindmaps(): MindMap[] | undefined {
  return useLiveQuery(async () => {
    const rows = await mdb.maps.toArray()
    return SEED_MAPS.map((s) => rows.find((r) => r.id === s.id)?.data ?? s)
  }, [])
}

export const useMapVersions = (id: string) =>
  useLiveQuery(() => mdb.versions.where('mapId').equals(id).reverse().sortBy('savedAt'), [id])

export async function saveMindmap(map: MindMap, label = 'Modification') {
  if (identity.role() === 'lecteur') throw new Error('Le rôle « lecteur » ne peut pas modifier une carte.')
  const prev = await mdb.maps.get(map.id)
  const before = prev?.data ?? seedMap(map.id)
  const newlyValidated = map.claims.some((c) => c.status === 'VALIDATED' && before?.claims.find((x) => x.id === c.id)?.status !== 'VALIDATED')
  if (newlyValidated && identity.role() !== 'valideur') throw new Error('Seul un valideur peut passer une affirmation en VALIDATED.')
  const data: MindMap = clone({ ...map, version: (prev?.data.version ?? map.version) + 1, updatedAt: new Date().toISOString().slice(0, 10) })
  await mdb.transaction('rw', mdb.maps, mdb.versions, async () => {
    if (!prev) await mdb.versions.add({ mapId: map.id, data: clone(seedMap(map.id) ?? map), label: 'Version d’origine (JSON)', savedAt: Date.now() - 1, author: 'Fichier source' })
    await mdb.maps.put({ id: map.id, data, updatedAt: Date.now(), updatedBy: who() })
    await mdb.versions.add({ mapId: map.id, data, label, savedAt: Date.now(), author: who() })
  })
  return data
}

export async function restoreMapVersion(v: MapVersionRow) {
  return saveMindmap(v.data, `Restauration : ${v.label}`)
}

export async function resetMindmap(id: string) {
  const s = seedMap(id)
  if (s) await saveMindmap(s, 'Retour à l’original (JSON)')
}
