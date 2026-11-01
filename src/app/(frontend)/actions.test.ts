import { beforeEach, expect, test } from 'vitest'
import { fakePayload, type FakePayload } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import { submitLead } from './actions'

let p: FakePayload
beforeEach(() => {
  p = usePayload(fakePayload())
})

const contact = { name: 'Khách', phone: '0942 922 000', email: 'k@example.com', message: 'Cần báo giá má phanh VF5' }

test('valid contact is stored as a new lead', async () => {
  expect(await submitLead('contact', contact)).toEqual({ ok: true })
  expect(p.store.leads[0]).toMatchObject({ kind: 'contact', name: 'Khách', phone: '0942 922 000' })
})

test('invalid input is rejected server-side and nothing is stored', async () => {
  const r = await submitLead('contact', { ...contact, phone: 'abc' })
  expect(r).toEqual({ ok: false, errors: { phone: expect.any(String) } })
  expect(p.create).not.toHaveBeenCalled()
})

test('only whitelisted fields are saved (no mass assignment)', async () => {
  await submitLead('contact', { ...contact, status: 'done', kind: 'partner', id: '1' } as any)
  expect(p.store.leads[0]).toMatchObject({ kind: 'contact' })
  expect(p.store.leads[0]).not.toHaveProperty('status')
})

test('partner registration validates partner-specific fields', async () => {
  const r = await submitLead('partner', contact)
  expect(r.ok).toBe(false)
  expect(Object.keys((r as any).errors)).toEqual(expect.arrayContaining(['partnerType', 'contactPerson', 'address', 'area']))
})

test('empty optional email is stored as undefined', async () => {
  await submitLead('partner', { partnerType: 'Gara sửa chữa', name: 'Gara A', contactPerson: 'Bình', phone: '0945544000', email: '', address: '12 Tây Mỗ', area: 'Hà Nội', message: 'Muốn nhập sỉ phụ tùng' })
  expect(p.store.leads[0].email).toBeUndefined()
})
