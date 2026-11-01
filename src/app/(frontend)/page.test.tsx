import { expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import Home, { metadata } from './page'

test('home shows vehicles, systems, featured products and articles', async () => {
  const p = usePayload(fakePayload(catalog(), SETTINGS))
  const t = textOf(await Home())
  expect(t).toContain('/dong-xe/vinfast-vf-5')
  expect(t).toContain('/he-thong/he-thong-phanh')
  expect(t).toContain('Má phanh trước VF5') // featured card
  expect(t).toContain('Bảo dưỡng phanh') // article card
  expect(t).toContain('1 dòng xe VinFast')
  expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'products', where: { featured: { equals: true } } }))
})

test('news section is hidden when there are no published articles', async () => {
  usePayload(fakePayload({ ...catalog(), articles: [] }, SETTINGS))
  expect(textOf(await Home())).not.toContain('Kiến thức kỹ thuật')
})

test('canonical is the site root', () => expect(metadata).toEqual({ alternates: { canonical: '/' } }))
