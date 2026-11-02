import { isValidElement } from 'react'
import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, PRODUCT, SETTINGS, textOf, VEHICLE } from '@/test/helpers'
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

test('sidebar shows a product count per vehicle (like the system page)', async () => {
  const e34 = { ...VEHICLE, id: 11, name: 'VinFast VF e34', slug: 'vinfast-vf-e34' }
  usePayload(
    fakePayload(
      {
        ...catalog(),
        vehicles: [VEHICLE, e34],
        products: [
          { ...PRODUCT, id: 1, vehicles: [VEHICLE, e34] }, // fits both
          { ...PRODUCT, id: 2, slug: 'b', vehicles: [VEHICLE] },
        ],
      },
      SETTINGS,
    ),
  )
  const el = await ByVehicle(props('vinfast-vf-5'))
  const counts: Record<string, string> = {}
  const walk = (n: any): void => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!isValidElement(n)) return
    const p = n.props as any
    if (String(p.className).startsWith('side-item')) {
      const cnt = [].concat(p.children).find((c: any) => isValidElement(c) && (c.props as any).className === 'cnt') as any
      counts[p.href] = cnt && String(cnt.props.children)
    }
    walk(p.children)
  }
  walk((el.props as any).side)
  expect(counts).toEqual({ '/dong-xe/vinfast-vf-5': '2', '/dong-xe/vinfast-vf-e34': '1' })
})

test('unknown vehicle -> 404', async () => {
  await expect(ByVehicle(props('xe-khong-co'))).rejects.toThrow('NEXT_NOT_FOUND')
})

test('metadata names the vehicle and uses its image', async () => {
  expect(await generateMetadata(props('vinfast-vf-5'))).toMatchObject({ title: 'Phụ tùng tương thích VinFast VF 5', alternates: { canonical: '/dong-xe/vinfast-vf-5' }, openGraph: { images: ['/api/media/file/car.webp'] } })
})
