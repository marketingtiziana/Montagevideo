import { db, SEED_VERSION } from '../db'
import type { Content } from '../types'
import { brands, pillars } from './brands'
import { channels } from './channels'
import { contents } from './contents'
import { images } from './images'
import { problems } from './problems'
import { journeys, matrix, rules } from './strategy'

/** Make relatedIds symmetric and drop dangling references. */
function normalize(list: Content[]): Content[] {
  const ids = new Set(list.map((c) => c.id))
  const map = new Map(list.map((c) => [c.id, new Set(c.relatedIds.filter((r) => ids.has(r) && r !== c.id))]))
  for (const [id, rel] of map) for (const r of rel) map.get(r)!.add(id)
  return list.map((c) => ({ ...c, relatedIds: [...map.get(c.id)!].sort() }))
}

export async function seedIfEmpty() {
  const seeded = await db.meta.get('seedVersion')
  if (seeded) return
  await seedAll()
}

export async function seedAll() {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
    await db.brands.bulkAdd(brands)
    await db.pillars.bulkAdd(pillars)
    await db.channels.bulkAdd(channels)
    await db.problems.bulkAdd(problems)
    await db.images.bulkAdd(images)
    await db.contents.bulkAdd(normalize(contents))
    await db.journeys.bulkAdd(journeys)
    await db.matrix.bulkAdd(matrix)
    await db.rules.bulkAdd(rules)
    await db.meta.put({ key: 'seedVersion', value: SEED_VERSION })
  })
}
