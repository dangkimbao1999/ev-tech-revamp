import { expect, test } from 'vitest'
import { catalog, fakePayload } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import { SITE_URL } from '@/lib/seo'
import sitemap from './sitemap'

test('lists static pages and every CMS entity with absolute URLs', async () => {
  usePayload(fakePayload(catalog()))
  const urls = (await sitemap()).map((e) => e.url.replace(SITE_URL, ''))
  expect(urls).toEqual(
    expect.arrayContaining(['/', '/san-pham', '/lien-he', '/gioi-thieu', '/dong-xe/vinfast-vf-5', '/he-thong/he-thong-phanh', '/san-pham/ma-phanh-truoc-vf5', '/bai-viet/bao-duong-phanh']),
  )
  expect(new Set(urls).size).toBe(urls.length)
})

test('only published articles are queried (access enforced)', async () => {
  const p = usePayload(fakePayload(catalog()))
  await sitemap()
  for (const [args] of p.find.mock.calls) expect((args as any).overrideAccess).toBe(false)
})
