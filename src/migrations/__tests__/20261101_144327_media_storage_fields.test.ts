import { expect, test, vi } from 'vitest'

vi.mock('@payloadcms/db-postgres', () => ({ sql: (s: TemplateStringsArray, ...v: unknown[]) => s.reduce((a, p, i) => a + p + (v[i] ?? ''), '') }))

const { up, down } = await import('../20261101_144327_media_storage_fields')
const { migrations } = await import('../index')

const run = async (fn: typeof up) => {
  const execute = vi.fn()
  await fn({ db: { execute }, payload: {}, req: {} } as any)
  return execute.mock.calls.map((c) => String(c[0])).join('\n')
}

// Supabase Storage (S3 plugin) reads media._objectkey; production crashed with
// 'column "_objectkey" does not exist' when the schema was generated with the plugin disabled.
test('adds the storage plugin columns to media, and down removes them', async () => {
  expect(await run(up)).toMatch(/ALTER TABLE "media" ADD COLUMN "_objectkey"/)
  expect(await run(up)).toMatch(/ALTER TABLE "media" ADD COLUMN "prefix"/)
  expect(await run(down)).toMatch(/DROP COLUMN "_objectkey"/)
})

test('runs after the initial migration', () => {
  const names = migrations.map((m) => m.name)
  expect(names.indexOf('20261101_144327_media_storage_fields')).toBeGreaterThan(names.indexOf('20261101_133842_initial'))
})
