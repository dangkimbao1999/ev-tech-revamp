import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, PRODUCT, SETTINGS } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import { andWhere, countArticles, getNav, getSettings, mediaUrl, SORTS, toCard } from './data'

beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('mediaUrl reads populated media, ignores ids', () => {
  expect(mediaUrl({ url: '/a.webp' })).toBe('/a.webp')
  expect(mediaUrl(5)).toBeNull()
  expect(mediaUrl(null)).toBeNull()
})

test('toCard maps a product to the client card shape', () => {
  expect(toCard(PRODUCT as any)).toEqual({ id: 100, slug: 'ma-phanh-truoc-vf5', name: 'Má phanh trước VF5', price: 650000, img: '/api/media/file/mp.webp', cat: 'Hệ thống phanh', sysSlug: 'he-thong-phanh' })
  expect(toCard({ ...PRODUCT, system: 1, images: [], price: null } as any)).toMatchObject({ img: null, cat: 'Phụ tùng', price: null })
})

test('andWhere adds a name/SKU search only when q is set', () => {
  expect(andWhere(undefined, { a: { equals: 1 } })).toEqual({ and: [{ a: { equals: 1 } }] })
  expect(andWhere('  phanh ')).toEqual({ and: [{ or: [{ name: { like: 'phanh' } }, { sku: { like: 'phanh' } }] }] })
})

test('getNav / getSettings / countArticles read through Payload', async () => {
  const nav = await getNav()
  expect(nav.vehicles[0].slug).toBe('vinfast-vf-5')
  expect(nav.systems[0].slug).toBe('he-thong-phanh')
  expect((await getSettings()).hotline).toBe('0942.922.000')
  expect(await countArticles()).toBe(1)
})

test('sort options map to Payload sort keys', () => expect(SORTS.map((s) => s[2])).toEqual(['-createdAt', 'price', '-price', 'name']))
