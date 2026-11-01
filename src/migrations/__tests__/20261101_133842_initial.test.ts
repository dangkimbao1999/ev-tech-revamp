import { readdirSync } from 'fs'
import path from 'path'
import { expect, test, vi } from 'vitest'

// Render sql`` to plain text so we can inspect the statements without a database.
vi.mock('@payloadcms/db-postgres', () => ({ sql: (s: TemplateStringsArray, ...v: unknown[]) => s.reduce((a, p, i) => a + p + (v[i] ?? ''), '') }))

const { up, down } = await import('../20261101_133842_initial')
const { migrations } = await import('../index')

const run = async (fn: typeof up) => {
  const execute = vi.fn()
  await fn({ db: { execute }, payload: {}, req: {} } as any)
  return execute.mock.calls.map((c) => String(c[0])).join('\n')
}

test('up creates every collection table', async () => {
  const sql = await run(up)
  for (const t of ['products', 'vehicles', 'systems', 'pages', 'articles', 'leads', 'media', 'users', 'settings']) expect(sql).toContain(`CREATE TABLE "${t}"`)
})

test('down drops what up created', async () => {
  const sql = await run(down)
  expect(sql).toContain('DROP TABLE "products" CASCADE')
  expect(sql).toContain('DROP TABLE "leads" CASCADE')
})

test('is registered for prodMigrations', () => {
  expect(migrations.map((m) => m.name)).toContain('20261101_133842_initial')
})

// `payload migrate` imports every top-level .ts file in src/migrations, so nothing else may live there
// (a test file next to the migration crashed the CLI with "Vitest mocker was not initialized").
test('src/migrations holds only migrations and the index at the top level', () => {
  const dir = path.resolve('src/migrations')
  const stray = readdirSync(dir).filter((f) => /\.(ts|js)$/.test(f) && f !== 'index.ts' && !migrations.some((m) => f === `${m.name}.ts`))
  expect(stray).toEqual([])
})
