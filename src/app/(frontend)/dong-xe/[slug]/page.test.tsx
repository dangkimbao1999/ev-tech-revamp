import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import ByVehicle, { generateMetadata } from './page'

const props = (slug: string, sp = {}) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve(sp) })
beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('filters the listing by vehicle (and optional system + keyword)', async () => {
  const el = await ByVehicle(props('vinfast-vf-5', { q: 'phanh', 'he-thong': 'he-thong-phanh' }))
  const where = (el.props as any).where
  expect(where.and).toEqual(expect.arrayContaining([{ vehicles: { contains: 10 } }, { system: { equals: 1 } }, { or: [{ name: { like: 'phanh' } }, { sku: { like: 'phanh' } }] }]))
  expect((el.props as any).basePath).toBe('/dong-xe/vinfast-vf-5')
  expect(textOf((el.props as any).hero)).toContain('Phụ tùng tương thích')
})

test('unknown vehicle -> 404', async () => {
  await expect(ByVehicle(props('xe-khong-co'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata names the vehicle and uses its image', async () => {
  expect(await generateMetadata(props('vinfast-vf-5'))).toMatchObject({ title: 'Phụ tùng tương thích VinFast VF 5', alternates: { canonical: '/dong-xe/vinfast-vf-5' }, openGraph: { images: ['/api/media/file/car.webp'] } })
})
