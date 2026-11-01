import { afterEach, expect, test } from 'vitest'
import robots from './robots'

afterEach(() => {
  delete process.env.NOINDEX
})

test('allows crawling (incl. product images) but not admin/api, and points to the sitemap', () => {
  const r = robots()
  expect(r.rules).toMatchObject({ userAgent: '*', allow: ['/', '/api/media/file/'], disallow: ['/admin', '/api/'] })
  expect(r.sitemap).toMatch(/\/sitemap\.xml$/)
})

test('NOINDEX blocks everything (staging / *.vercel.app)', () => {
  process.env.NOINDEX = '1'
  expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
})
