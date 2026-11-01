import { expect, test } from 'vitest'
import { fmt } from './fmt'

test('formats VND with dot separators', () => {
  expect(fmt(650000)).toBe('650.000₫')
  expect(fmt(1250000)).toBe('1.250.000₫')
})

test('missing or zero price means "contact for quote"', () => {
  expect(fmt(null)).toBe('Liên hệ báo giá')
  expect(fmt(undefined)).toBe('Liên hệ báo giá')
  expect(fmt(0)).toBe('Liên hệ báo giá')
})
