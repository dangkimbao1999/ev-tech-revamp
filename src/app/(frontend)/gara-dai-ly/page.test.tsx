import { isValidElement } from 'react'
import { beforeEach, expect, test } from 'vitest'
import { fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import Gara, { metadata } from './page'

const findProp = (node: any, name: string): any => {
  if (Array.isArray(node)) return node.map((n) => findProp(n, name)).find((x) => x !== undefined)
  if (!isValidElement(node)) return undefined
  const p = node.props as any
  return name in p ? p[name] : findProp(p.children, name)
}

beforeEach(() => {
  usePayload(fakePayload({}, SETTINGS))
})

test('partner page lists partner types linking to the form with a preset role', async () => {
  const el = await Gara({ searchParams: Promise.resolve({}) })
  const t = textOf(el)
  expect(t).toContain('Dành cho Gara & Đại lý')
  expect(t).toContain('/gara-dai-ly?loai=' + encodeURIComponent('Đại lý phân phối') + '#register')
  expect(t).toContain('Thứ 2 – Thứ 7') // working hours from settings
})

test('?loai= preselects the partner type in the form', async () => {
  const el = await Gara({ searchParams: Promise.resolve({ loai: 'Gara sửa chữa' }) })
  expect(findProp(el, 'initialType')).toBe('Gara sửa chữa')
})

test('has canonical + OG image metadata', () => expect(metadata).toMatchObject({ alternates: { canonical: '/gara-dai-ly' }, openGraph: { images: ['/img/hero-gara.jpg'] } }))
