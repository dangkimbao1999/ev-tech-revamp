import { isValidElement } from 'react'
import { vi } from 'vitest'

type Doc = Record<string, any>
type Where = Record<string, any> | undefined

const get = (doc: Doc, key: string) => {
  const v = doc[key]
  return v && typeof v === 'object' && !Array.isArray(v) && 'id' in v ? v.id : v
}
const matches = (doc: Doc, where: Where): boolean => {
  if (!where) return true
  return Object.entries(where).every(([k, cond]) => {
    if (k === 'and') return (cond as Where[]).every((w) => matches(doc, w))
    if (k === 'or') return (cond as Where[]).some((w) => matches(doc, w))
    const v = get(doc, k)
    const ids = Array.isArray(doc[k]) ? doc[k].map((x: any) => (typeof x === 'object' ? x.id : x)) : null
    if ('equals' in cond) return v === cond.equals
    if ('not_equals' in cond) return v !== cond.not_equals
    if ('contains' in cond) return ids ? ids.includes(cond.contains) : String(v ?? '').includes(cond.contains)
    if ('like' in cond) return String(v ?? '').toLowerCase().includes(String(cond.like).toLowerCase())
    if ('exists' in cond) return (v != null) === cond.exists
    return true
  })
}

/** In-memory stand-in for the Payload Local API (only the calls the app makes). */
export function fakePayload(data: Record<string, Doc[]> = {}, settings: Doc = {}) {
  const store: Record<string, Doc[]> = structuredClone(data)
  let nextId = 1000
  const all = (c: string) => (store[c] ??= [])
  return {
    store,
    logger: { info: vi.fn(), error: vi.fn() },
    find: vi.fn(async ({ collection, where, limit = 10, page = 1 }: any) => {
      const docs = all(collection).filter((d) => matches(d, where))
      const size = limit || docs.length || 1
      const totalPages = Math.max(1, Math.ceil(docs.length / size))
      return { docs: docs.slice((page - 1) * size, page * size), totalDocs: docs.length, totalPages, page, hasPrevPage: page > 1, hasNextPage: page < totalPages }
    }),
    count: vi.fn(async ({ collection, where }: any) => ({ totalDocs: all(collection).filter((d) => matches(d, where)).length })),
    create: vi.fn(async ({ collection, data }: any) => {
      const doc = { id: nextId++, ...data }
      all(collection).push(doc)
      return doc
    }),
    update: vi.fn(async ({ collection, id, data }: any) => Object.assign(all(collection).find((d) => d.id === id)!, data)),
    delete: vi.fn(async ({ collection }: any) => ({ docs: store[collection]?.splice(0) ?? [] })),
    findGlobal: vi.fn(async () => settings),
    updateGlobal: vi.fn(async ({ data }: any) => Object.assign(settings, data)),
  }
}
export type FakePayload = ReturnType<typeof fakePayload>

export const SETTINGS = {
  company: 'Công ty Cổ phần EVTECH Group',
  tagline: 'Giải pháp phụ tùng thay thế cho xe điện',
  intro: 'Nhà phân phối phụ tùng',
  hotline: '0942.922.000',
  hotline2: '0945.544.000',
  email: 'evtech@example.com',
  website: 'evtech.vn',
  address: 'Xuân Phương, Hà Nội',
  hours: 'Thứ 2 – Thứ 7',
  socials: [],
}

const img = (id: number, file: string) => ({ id, url: `/api/media/file/${file}`, alt: file })
export const SYSTEM = { id: 1, name: 'Hệ thống phanh', slug: 'he-thong-phanh', description: 'Má phanh…', image: img(90, 'phanh.webp') }
export const VEHICLE = { id: 10, name: 'VinFast VF 5', slug: 'vinfast-vf-5', order: 0, image: img(91, 'car.webp') }
export const PRODUCT = {
  id: 100,
  name: 'Má phanh trước VF5',
  slug: 'ma-phanh-truoc-vf5',
  sku: 'EVT-33',
  price: 650000,
  system: SYSTEM,
  vehicles: [VEHICLE],
  images: [img(92, 'mp.webp')],
  featured: true,
  inStock: true,
  description: null,
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
}
export const PAGE = { id: 5, title: 'Giới thiệu', slug: 'gioi-thieu', description: 'EVTech là đơn vị…', content: null, updatedAt: '2026-11-01T00:00:00Z' }
export const ARTICLE = { id: 7, title: 'Bảo dưỡng phanh', slug: 'bao-duong-phanh', excerpt: 'Tóm tắt', publishedAt: '2026-11-01T00:00:00Z', _status: 'published', cover: null, content: null, updatedAt: '2026-11-01T00:00:00Z' }

export const catalog = () => ({ products: [PRODUCT], systems: [SYSTEM], vehicles: [VEHICLE], pages: [PAGE], articles: [ARTICLE], media: [] as Doc[] })

/** Collect every string reachable in a React element tree (props included) without rendering it. */
export function textOf(node: unknown, depth = 0): string {
  if (depth > 40 || node == null || typeof node === 'boolean' || typeof node === 'function') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map((n) => textOf(n, depth + 1)).join('') // JSX children: "Gọi {hotline}"
  if (isValidElement(node)) return textOf((node as { props: unknown }).props, depth + 1)
  if (typeof node === 'object') return Object.values(node as object).map((v) => textOf(v, depth + 1)).join(' ')
  return ''
}

/** Shared state for the next/navigation mock (see navigationMock). */
export const nav = { push: vi.fn(), pathname: '/', search: '' }
export const navigationMock = () => ({
  useRouter: () => ({ push: nav.push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
})
