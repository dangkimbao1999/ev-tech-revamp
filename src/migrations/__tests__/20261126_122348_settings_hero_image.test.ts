import { expect, test, vi } from 'vitest'

vi.mock('@payloadcms/db-postgres', () => ({ sql: (s: TemplateStringsArray, ...v: unknown[]) => s.reduce((a, p, i) => a + p + (v[i] ?? ''), '') }))

const { up, down } = await import('../20261126_122348_settings_hero_image')
const { migrations } = await import('../index')

const run = async (fn: typeof up) => {
  const execute = vi.fn()
  await fn({ db: { execute }, payload: {}, req: {} } as any)
  return execute.mock.calls.map((c) => String(c[0])).join('\n')
}

test('adds the nullable home banner reference to settings, and down removes it', async () => {
  expect(await run(up)).toMatch(/ALTER TABLE "settings" ADD COLUMN "hero_image_id" integer;/)
  expect(await run(up)).toMatch(/REFERENCES "public"\."media"\("id"\) ON DELETE set null/)
  expect(await run(down)).toMatch(/DROP COLUMN "hero_image_id"/)
})

test('runs last', () => expect(migrations.at(-1)!.name).toBe('20261126_122348_settings_hero_image'))
