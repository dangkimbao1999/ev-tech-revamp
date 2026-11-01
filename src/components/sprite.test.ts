import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { expect, test } from 'vitest'
import { SPRITE } from './sprite'

const ids = [...SPRITE.matchAll(/<symbol id="i-([a-z]+)"/g)].map((m) => m[1])

test('each icon symbol is defined once with a viewBox', () => {
  expect(ids.length).toBeGreaterThan(20)
  expect(new Set(ids).size).toBe(ids.length)
  expect(SPRITE.match(/<symbol /g)!.length).toBe(SPRITE.match(/viewBox="0 0 24 24"/g)!.length)
})

test('every icon referenced in the UI exists in the sprite', () => {
  const files = ['components', 'app/(frontend)'].flatMap((d) =>
    readdirSync(path.resolve('src', d), { recursive: true, encoding: 'utf8' })
      .filter((f) => /\.tsx$/.test(f) && !f.includes('.test.'))
      .map((f) => readFileSync(path.resolve('src', d, f), 'utf8')),
  )
  const used = new Set(files.flatMap((src) => [...src.matchAll(/(?:<Ic id="|ic: ?'|ic="|#i-)([a-z]+)/g)].map((m) => m[1])))
  for (const id of used) expect(ids, `icon "${id}"`).toContain(id)
})
