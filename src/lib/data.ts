import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { cache } from 'react'
import type { Media, Product, System } from '@/payload-types'

export const db = () => getPayload({ config })

export { fmt } from './fmt'

export const mediaUrl = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? ((m as Media).url ?? null) : null

/** Lightweight product shape that client components receive. */
export type Card = { id: number; slug: string; name: string; price: number | null; img: string | null; cat: string; sysSlug: string }

export const toCard = (p: Product): Card => {
  const sys = typeof p.system === 'object' ? (p.system as System) : null
  return {
    id: p.id,
    slug: p.slug || String(p.id),
    name: p.name,
    price: p.price ?? null,
    img: mediaUrl(p.images?.[0]),
    cat: sys?.name || 'Phụ tùng',
    sysSlug: sys?.slug || '',
  }
}

export const getSettings = cache(async () => (await db()).findGlobal({ slug: 'settings' }))

export const getNav = cache(async () => {
  const p = await db()
  const [vehicles, systems] = await Promise.all([
    p.find({ collection: 'vehicles', limit: 100, depth: 1 }),
    p.find({ collection: 'systems', limit: 100, depth: 1 }),
  ])
  return { vehicles: vehicles.docs, systems: systems.docs }
})

export const SORTS = [
  ['new', 'Mới nhất', '-createdAt'],
  ['asc', 'Giá tăng dần', 'price'],
  ['desc', 'Giá giảm dần', '-price'],
  ['name', 'Tên A → Z', 'name'],
] as const

export const PAGE_SIZE = 12

/** Published article count (nav/footer hide 'Bài viết' when there are none). */
export const countArticles = cache(async () => (await (await db()).count({ collection: 'articles', overrideAccess: false })).totalDocs)

export type ListSP = Promise<{ sort?: string; page?: string; q?: string; 'he-thong'?: string }>

/** Combine filters with optional keyword search on name / SKU. */
export const andWhere = (q: string | undefined, ...w: Where[]): Where => ({
  and: [...w, ...(q?.trim() ? [{ or: [{ name: { like: q.trim() } }, { sku: { like: q.trim() } }] }] : [])],
})
