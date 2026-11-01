import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import AllProducts, { generateMetadata } from './page'

const props = (sp = {}) => ({ searchParams: Promise.resolve(sp) })
beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('without a query lists everything', async () => {
  const el = await AllProducts(props())
  expect((el.props as any).where).toEqual({ and: [] })
  expect((el.props as any).label).toBe('Tất cả sản phẩm')
})

test('with a query searches name/SKU and keeps it on vehicle links', async () => {
  const el = await AllProducts(props({ q: 'phanh' }))
  expect((el.props as any).where.and[0].or).toHaveLength(2)
  expect(textOf((el.props as any).side)).toContain('/dong-xe/vinfast-vf-5?q=phanh')
})

test('search result pages are noindex; the base listing is indexable', async () => {
  expect(await generateMetadata(props({ q: 'x' }))).toMatchObject({ robots: { index: false, follow: true } })
  expect(await generateMetadata(props())).not.toHaveProperty('robots')
})
