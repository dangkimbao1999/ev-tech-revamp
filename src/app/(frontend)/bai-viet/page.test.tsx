import { expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import Articles, { metadata } from './page'

test('lists published articles (access enforced)', async () => {
  const p = usePayload(fakePayload(catalog(), SETTINGS))
  const t = textOf(await Articles())
  expect(t).toContain('Bảo dưỡng phanh')
  expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'articles', overrideAccess: false }))
})

test('shows an empty message when there are no articles', async () => {
  usePayload(fakePayload({ articles: [] }, SETTINGS))
  expect(textOf(await Articles())).toContain('Chưa có bài viết.')
})

test('has canonical metadata', () => expect(metadata).toMatchObject({ alternates: { canonical: '/bai-viet' } }))
