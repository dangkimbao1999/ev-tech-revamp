import { isValidElement } from 'react'
import { beforeEach, expect, test } from 'vitest'
import { fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import Contact, { metadata } from './page'

const findProp = (node: any, name: string): any => {
  if (Array.isArray(node)) return node.map((n) => findProp(n, name)).find((x) => x !== undefined)
  if (!isValidElement(node)) return undefined
  const p = node.props as any
  return name in p ? p[name] : findProp(p.children, name)
}
const page = async (msg?: string) => Contact({ searchParams: Promise.resolve(msg === undefined ? {} : { msg }) })

beforeEach(() => {
  usePayload(fakePayload({ pages: [] }, SETTINGS))
})

test('shows company contacts from settings', async () => {
  const t = textOf(await page())
  expect(t).toContain('0942.922.000 – 0945.544.000')
  expect(t).toContain('Xuân Phương, Hà Nội')
})

test('preset message keys expand; free text passes through (capped at 500)', async () => {
  expect(findProp(await page('hybrid'), 'initialMsg')).toBe('Tôi cần tư vấn phụ tùng cho xe Hybrid.')
  expect(findProp(await page('Tôi cần báo giá X'), 'initialMsg')).toBe('Tôi cần báo giá X')
  expect(findProp(await page('a'.repeat(900)), 'initialMsg')).toHaveLength(500)
  expect(findProp(await page(), 'initialMsg')).toBe('')
})

test('has canonical metadata', () => expect(metadata).toMatchObject({ title: 'Liên hệ', alternates: { canonical: '/lien-he' } }))
