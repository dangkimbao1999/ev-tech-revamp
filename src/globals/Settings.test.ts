import { expect, test } from 'vitest'
import { Settings } from './Settings'

test('company settings are public and default to the real EVTECH contacts', () => {
  expect((Settings.access!.read as any)()).toBe(true)
  const f = Object.fromEntries(Settings.fields.map((x: any) => [x.name, x]))
  expect(f.hotline.defaultValue).toBe('0942.922.000')
  expect(f.hotline2.defaultValue).toBe('0945.544.000')
  expect(f.address.defaultValue).toMatch(/Xuân Phương, Hà Nội/)
  expect(f.socials).toMatchObject({ type: 'array' })
})
