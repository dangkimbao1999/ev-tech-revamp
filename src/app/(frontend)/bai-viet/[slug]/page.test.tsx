import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import Article, { generateMetadata } from './page'

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })
beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('renders the article', async () => {
  const t = textOf(await Article(params('bao-duong-phanh')))
  expect(t).toContain('Bảo dưỡng phanh')
  expect(t).toContain('Tóm tắt')
})

test('unknown article -> 404', async () => {
  await expect(Article(params('nope'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata is article-typed Open Graph with the publish date', async () => {
  const m = await generateMetadata(params('bao-duong-phanh'))
  expect(m).toMatchObject({ title: 'Bảo dưỡng phanh', alternates: { canonical: '/bai-viet/bao-duong-phanh' }, openGraph: { type: 'article', publishedTime: '2026-11-01T00:00:00Z', url: '/bai-viet/bao-duong-phanh' } })
})
