import type { FakePayload } from './helpers'

// Kept on globalThis so it survives vi.resetModules() (seed.test re-imports the seed script).
const g = globalThis as { __fakePayload?: FakePayload | null }

/** Holder for the fake Payload instance returned by the mocked getPayload(). */
export const slot = {
  get current() {
    return g.__fakePayload ?? null
  },
}
export const usePayload = (p: FakePayload) => {
  g.__fakePayload = p
  return p
}
