import { isValidElement } from 'react'
import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import ContentPage, { generateMetadata } from './page'

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })
beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('renders a CMS content page with an h1 title', async () => {
  const t = textOf(await ContentPage(params('gioi-thieu')))
  expect(t).toContain('Giới thiệu')
  const heads: any[] = []
  const walk = (n: any): void => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!isValidElement(n)) return
    const p = n.props as any
    if ('ov' in p) heads.push(p)
    walk(p.children)
  }
  walk(await ContentPage(params('gioi-thieu')))
  expect(heads[0]).toMatchObject({ h1: true, h: 'Giới thiệu' })
})

test('unknown slug -> 404', async () => {
  await expect(ContentPage(params('khong-co'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata uses the page description and canonical slug', async () => {
  expect(await generateMetadata(params('gioi-thieu'))).toMatchObject({ title: 'Giới thiệu', description: 'EVTech là đơn vị…', alternates: { canonical: '/gioi-thieu' } })
  expect(await generateMetadata(params('khong-co'))).toEqual({})
})
