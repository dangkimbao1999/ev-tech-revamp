import { isValidElement } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { catalog, fakePayload, SETTINGS } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'

afterEach(() => {
  delete process.env.NOINDEX
  vi.resetModules()
})

const findProps = (node: any, pred: (p: any) => boolean): any[] => {
  if (Array.isArray(node)) return node.flatMap((n) => findProps(n, pred))
  if (!isValidElement(node)) return []
  const p = node.props as any
  return [...(pred(p) ? [p] : []), ...findProps(p.children, pred)]
}

test('site metadata: base URL, title template, Google verification tokens', async () => {
  const { metadata } = await import('./layout')
  expect(metadata.metadataBase).toBeInstanceOf(URL)
  expect(metadata.title).toMatchObject({ template: '%s | EVTECH' })
  expect((metadata.verification as any).google).toHaveLength(2)
  expect(metadata).not.toHaveProperty('robots')
})

test('NOINDEX adds a noindex robots directive', async () => {
  process.env.NOINDEX = '1'
  const { metadata } = await import('./layout')
  expect(metadata.robots).toEqual({ index: false, follow: false })
})

test('layout passes nav data to the header and emits Organization JSON-LD', async () => {
  usePayload(fakePayload(catalog(), SETTINGS))
  const { default: RootLayout } = await import('./layout')
  const el = await RootLayout({ children: 'CHILD' })
  const [header] = findProps(el, (p) => 'hasArticles' in p)
  expect(header).toMatchObject({ hotline: '0942.922.000', hasArticles: true, vehicles: [{ slug: 'vinfast-vf-5' }] })
  const [ld] = findProps(el, (p) => p.data?.['@type'] === 'AutoPartsStore')
  expect(ld.data).toMatchObject({ telephone: '0942.922.000' })
  expect(findProps(el, (p) => p.lang === 'vi')).toHaveLength(1)
})
