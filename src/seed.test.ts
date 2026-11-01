import { readFileSync } from 'fs'
import path from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { fakePayload } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'

const catalog = JSON.parse(readFileSync(path.resolve('seed-data/catalog.json'), 'utf8'))

const runSeed = async (env: Record<string, string> = {}) => {
  vi.resetModules()
  Object.assign(process.env, env)
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
  await import('./seed')
  exit.mockRestore()
}
afterEach(() => {
  delete process.env.SEED_FRESH
})

test('seeds the full catalog from seed-data into an empty database', async () => {
  const p = usePayload(fakePayload())
  await runSeed()
  expect(p.store.vehicles).toHaveLength(catalog.vehicles.length)
  expect(p.store.systems).toHaveLength(catalog.systems.length)
  expect(p.store.products).toHaveLength(catalog.products.length)
  expect(p.store.pages).toHaveLength(catalog.pages.length)
  // every image is uploaded exactly once
  const files = p.create.mock.calls.filter(([a]: any) => a.collection === 'media').map(([a]: any) => path.basename(a.filePath))
  expect(new Set(files).size).toBe(files.length)
  // products keep old slugs (for 301s) and link to their system
  const first = catalog.products[0]
  const created = p.store.products.find((x: any) => x.slug === first.slug)!
  expect(created.sku).toBe(`EVT-${first.oldId}`)
  expect(created.system).toBe(p.store.systems.find((s: any) => s.name === first.system)!.id)
}, 30_000)

test('skips when a catalog already exists', async () => {
  const p = usePayload(fakePayload({ products: [{ id: 1 }] }))
  await runSeed()
  expect(p.create).not.toHaveBeenCalled()
})

test('SEED_FRESH wipes catalog collections but never users or leads', async () => {
  const p = usePayload(fakePayload({ products: [{ id: 1 }], users: [{ id: 1 }], leads: [{ id: 1 }] }))
  await runSeed({ SEED_FRESH: '1' })
  const wiped = p.delete.mock.calls.map(([a]: any) => a.collection)
  expect(wiped).toEqual(expect.arrayContaining(['products', 'pages', 'articles', 'vehicles', 'systems', 'media']))
  expect(wiped).not.toContain('users')
  expect(wiped).not.toContain('leads')
  expect(p.store.products).toHaveLength(catalog.products.length)
}, 30_000)
