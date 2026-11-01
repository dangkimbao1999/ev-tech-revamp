import { isValidElement } from 'react'
import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, PRODUCT, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import ProductPage, { generateMetadata } from './page'

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })
const findJsonLd = (node: any): any[] => {
  if (Array.isArray(node)) return node.flatMap(findJsonLd)
  if (!isValidElement(node)) return []
  const p = node.props as any
  return [...(p.data ? [p.data] : []), ...findJsonLd(p.children)]
}

beforeEach(() => {
  usePayload(fakePayload({ ...catalog(), products: [PRODUCT, { ...PRODUCT, id: 101, slug: 'dia-phanh', name: 'Đĩa phanh' }] }, SETTINGS))
})

test('renders specs, price, compatibility and related items', async () => {
  const t = textOf(await ProductPage(params('ma-phanh-truoc-vf5')))
  expect(t).toContain('Má phanh trước VF5')
  expect(t).toContain('650.000₫')
  expect(t).toContain('EVT-33')
  expect(t).toContain('VinFast VF 5')
  expect(t).toContain('Theo chính sách EVTECH') // no invented warranty
  expect(t).toContain('/san-pham/dia-phanh') // related, same system, not itself
})

test('emits Product + BreadcrumbList JSON-LD with absolute image URLs', async () => {
  const [product, crumbs] = findJsonLd(await ProductPage(params('ma-phanh-truoc-vf5'))).flat()
  expect(product).toMatchObject({ '@type': 'Product', sku: 'EVT-33', offers: { price: 650000, priceCurrency: 'VND' } })
  expect(product.image[0]).toMatch(/^https?:\/\/.+\/api\/media\/file\/mp\.webp$/)
  expect(crumbs['@type']).toBe('BreadcrumbList')
})

test('no price -> no Offer in JSON-LD', async () => {
  usePayload(fakePayload({ ...catalog(), products: [{ ...PRODUCT, price: null }] }, SETTINGS))
  const [product] = findJsonLd(await ProductPage(params('ma-phanh-truoc-vf5'))).flat()
  expect(product).not.toHaveProperty('offers')
})

test('unknown product -> 404', async () => {
  await expect(ProductPage(params('khong-co'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata mentions SKU, compatibility and price', async () => {
  const m = await generateMetadata(params('ma-phanh-truoc-vf5'))
  expect(m.alternates).toEqual({ canonical: '/san-pham/ma-phanh-truoc-vf5' })
  expect(String(m.description)).toMatch(/EVT-33.*VinFast VF 5.*650\.000₫/)
})
