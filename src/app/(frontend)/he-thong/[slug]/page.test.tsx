import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import BySystem, { generateMetadata } from './page'

const props = (slug: string, sp = {}) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve(sp) })
beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('filters by system and shows per-system counts in the sidebar', async () => {
  const el = await BySystem(props('he-thong-phanh'))
  expect((el.props as any).where).toEqual({ and: [{ system: { equals: 1 } }] })
  const side = textOf((el.props as any).side)
  expect(side).toContain('Hệ thống phanh')
  expect(side).toMatch(/cnt\s*1|1/)
})

test('unknown system -> 404', async () => {
  await expect(BySystem(props('khong-co'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata describes the system', async () => {
  const m = await generateMetadata(props('he-thong-phanh'))
  expect(m).toMatchObject({ title: 'Phụ tùng Hệ thống phanh xe điện VinFast', alternates: { canonical: '/he-thong/he-thong-phanh' } })
  expect(String(m.description)).toContain('Má phanh')
})
