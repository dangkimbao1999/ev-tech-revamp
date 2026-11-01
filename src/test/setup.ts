import { cleanup } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, vi } from 'vitest'

// Payload config pulls in DB adapters/sharp; tests never need the real one.
vi.mock('@payload-config', () => ({ default: {} }))
// getPayload() returns whatever fake the test installed with usePayload().
vi.mock('payload', async () => ({ getPayload: vi.fn(async () => (await import('./payload-slot')).slot.current) }))
vi.mock('next/font/google', () => ({ Be_Vietnam_Pro: () => ({ variable: 'font-bvp', className: 'font' }) }))
vi.mock('next/navigation', async () => (await import('./helpers')).navigationMock())
vi.mock('next/link', () => ({
  default: ({ href, children, scroll: _s, prefetch: _p, ...rest }: Record<string, any>) => createElement('a', { href, ...rest }, children),
}))

// Newer Node ships its own global localStorage that shadows jsdom's; use a plain in-memory one.
const mem = new Map<string, string>()
const storage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size
  },
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
// jsdom has no layout APIs.
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
