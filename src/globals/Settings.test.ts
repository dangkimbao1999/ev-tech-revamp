import { expect, test } from 'vitest'
import { HERO, Settings, validateHero } from './Settings'

test('company settings are public and default to the real EVTECH contacts', () => {
  expect((Settings.access!.read as any)()).toBe(true)
  const f = Object.fromEntries(Settings.fields.map((x: any) => [x.name, x]))
  expect(f.hotline.defaultValue).toBe('0942.922.000')
  expect(f.hotline2.defaultValue).toBe('0945.544.000')
  expect(f.address.defaultValue).toMatch(/Xuân Phương, Hà Nội/)
  expect(f.socials).toMatchObject({ type: 'array' })
})

const req = (m: unknown) => ({ payload: { findByID: async () => m } }) as any
const check = (v: unknown, m?: unknown) => validateHero(v, { req: req(m) } as any)

test('home banner is optional (empty = default banner)', async () => {
  expect(await check(null)).toBe(true)
})

test('home banner must be exactly the fixed size and an image', async () => {
  expect(await check(5, { width: 1920, height: 815, mimeType: 'image/jpeg' })).toBe(true)
  expect(await check({ id: 5 }, { width: 1920, height: 815, mimeType: 'image/webp' })).toBe(true)
  expect(await check(5, { width: 1920, height: 1080, mimeType: 'image/jpeg' })).toMatch(/1920×815 px.*1920×1080/)
  expect(await check(5, { width: 1000, height: 425, mimeType: 'image/png' })).toMatch(/1920×815/)
  expect(await check(5, { width: 1920, height: 815, mimeType: 'application/pdf' })).toMatch(/JPG, PNG hoặc WebP/)
  expect(await check(5, null)).toMatch(/Không tìm thấy/)
})

test('default banner file matches the enforced size', async () => {
  const { readFileSync } = await import('fs')
  const f = readFileSync('public/img/hero-home.jpg')
  let i = 2
  while (f[i + 1] !== 0xc0 && f[i + 1] !== 0xc2) i += 2 + f.readUInt16BE(i + 2)
  expect([f.readUInt16BE(i + 7), f.readUInt16BE(i + 5)]).toEqual([HERO.w, HERO.h])
})
