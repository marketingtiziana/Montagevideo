import Dexie, { type EntityTable } from 'dexie'
import type {
  Brand,
  Channel,
  Content,
  ImageAsset,
  Journey,
  LayoutPos,
  MatrixRow,
  Meta,
  Pillar,
  Problem,
  Rule,
  StoredFile,
} from './types'

/**
 * Local-first persistence (IndexedDB via Dexie).
 * Every view reads from these tables through live queries, so a change
 * made anywhere is reflected everywhere instantly and survives reloads.
 * Evolution path: swap this module for a Supabase/Postgres adapter with
 * the same table shapes (see README).
 */
export class WorkspaceDB extends Dexie {
  contents!: EntityTable<Content, 'id'>
  problems!: EntityTable<Problem, 'id'>
  images!: EntityTable<ImageAsset, 'id'>
  files!: EntityTable<StoredFile, 'id'>
  pillars!: EntityTable<Pillar, 'id'>
  channels!: EntityTable<Channel, 'id'>
  brands!: EntityTable<Brand, 'id'>
  journeys!: EntityTable<Journey, 'id'>
  matrix!: EntityTable<MatrixRow, 'id'>
  rules!: EntityTable<Rule, 'id'>
  layout!: EntityTable<LayoutPos, 'id'>
  meta!: EntityTable<Meta, 'key'>

  constructor() {
    super('fynovates-workspace')
    this.version(1).stores({
      contents: 'id, status, validation, format, pillar, *brands, *platforms, *problemIds, *imageIds, updatedAt',
      problems: 'id, pillar, validation, *imageIds',
      images: 'id, type, brand, platform, createdAt',
      files: 'id',
      pillars: 'id',
      channels: 'id, brand',
      brands: 'id',
      journeys: 'id',
      matrix: 'id, order',
      rules: 'id, scope',
      layout: 'id',
      meta: 'key',
    })
  }
}

export const db = new WorkspaceDB()

export const SEED_VERSION = 1
