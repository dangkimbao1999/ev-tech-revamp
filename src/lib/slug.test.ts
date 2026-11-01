import { expect, test } from 'vitest'
import { slugField, slugify } from './slug'

test('slugify strips Vietnamese diacritics and punctuation', () => {
  expect(slugify('Điện – sạc')).toBe('dien-sac')
  expect(slugify('Má Phanh Trước (VF5) | EVTech!')).toBe('ma-phanh-truoc-vf5-evtech')
  expect(slugify('  Hệ thống phanh  ')).toBe('he-thong-phanh')
})

test('slugField fills from the source field when empty, normalizes when set', () => {
  const f = slugField('name') as any
  const hook = f.hooks.beforeValidate[0]
  expect(f).toMatchObject({ name: 'slug', unique: true })
  expect(hook({ value: '', data: { name: 'Gầm lái' } })).toBe('gam-lai')
  expect(hook({ value: 'My Slug', data: { name: 'x' } })).toBe('my-slug')
  expect(hook({ value: undefined, data: {} })).toBeUndefined()
})
