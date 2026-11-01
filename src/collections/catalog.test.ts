import { describe, expect, test } from 'vitest'
import { Articles, Leads, Pages, Products, Systems, Vehicles } from './catalog'

const req = (user: unknown = null) => ({ req: { user } }) as any
const fieldNames = (c: { fields: any[] }): string[] => c.fields.flatMap((f) => (f.type === 'row' ? fieldNames(f) : [f.name]))

describe('public catalog collections', () => {
  test.each([Products, Vehicles, Systems, Pages])('$slug is publicly readable and has a slug field', (c) => {
    expect((c.access!.read as any)()).toBe(true)
    expect(fieldNames(c)).toContain('slug')
  })

  test('products reference systems, vehicles and media', () => {
    const f = Object.fromEntries(Products.fields.flatMap((x: any) => (x.type === 'row' ? x.fields : [x])).map((x: any) => [x.name, x]))
    expect(f.system).toMatchObject({ type: 'relationship', relationTo: 'systems', required: true })
    expect(f.vehicles).toMatchObject({ relationTo: 'vehicles', hasMany: true })
    expect(f.images).toMatchObject({ type: 'upload', relationTo: 'media', hasMany: true })
    expect(f.warranty.defaultValue).toBeUndefined() // no invented warranty
  })
})

describe('articles', () => {
  test('anonymous visitors only see published articles; editors see all', () => {
    expect((Articles.access!.read as any)(req())).toEqual({ _status: { equals: 'published' } })
    expect((Articles.access!.read as any)(req({ id: 1 }))).toBe(true)
    expect(Articles.versions).toMatchObject({ drafts: true })
  })
})

describe('leads (customer data)', () => {
  test('cannot be read or created anonymously over the API', () => {
    expect((Leads.access!.read as any)(req())).toBe(false)
    expect((Leads.access!.create as any)(req())).toBe(false)
    expect((Leads.access!.read as any)(req({ id: 1 }))).toBe(true)
  })
  test('has kind + status workflow fields', () => {
    expect(fieldNames(Leads)).toEqual(expect.arrayContaining(['kind', 'status', 'name', 'phone', 'message']))
  })
})
