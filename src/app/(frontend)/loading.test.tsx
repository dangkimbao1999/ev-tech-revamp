import { render, screen } from '@testing-library/react'
import { readFileSync } from 'fs'
import path from 'path'
import { expect, test } from 'vitest'
import Loading from './loading'

// Dynamic routes aren't prefetched; this skeleton is, so clicks show feedback immediately.
test('shows an accessible loading state', () => {
  render(<Loading />)
  const status = screen.getByRole('status')
  expect(status.getAttribute('aria-live')).toBe('polite')
  expect(status.textContent).toContain('Đang tải')
})

test('spinner is the site gear icon', () => {
  const { container } = render(<Loading />)
  const icon = container.querySelector('svg.spin-gear use')
  expect(icon?.getAttribute('href')).toBe('#i-gear')
})

// Supabase runs in Singapore; functions in the default US region add ~200ms per DB query.
test('Vercel functions run in Singapore next to the database', () => {
  const cfg = JSON.parse(readFileSync(path.resolve('vercel.json'), 'utf8'))
  expect(cfg.regions).toEqual(['sin1'])
})
