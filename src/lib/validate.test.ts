import { describe, expect, test } from 'vitest'
import { AREAS, CONTACT_RULES, PARTNER_RULES, PARTNER_TYPES, validate } from './validate'

const contact = { name: 'An', phone: '0942 922 000', email: 'a@b.vn', message: 'Cần má phanh VF e34' }
const partner = { partnerType: PARTNER_TYPES[0], name: 'Gara A', contactPerson: 'Bình', phone: '0945.544.000', address: '12 Tây Mỗ', area: AREAS[0], message: 'Muốn nhập sỉ phụ tùng' }

describe('contact rules', () => {
  test('valid input has no errors', () => expect(validate(CONTACT_RULES, contact)).toEqual({}))
  test('rejects bad phone and email', () =>
    expect(Object.keys(validate(CONTACT_RULES, { ...contact, phone: '123', email: 'x' })).sort()).toEqual(['email', 'phone']))
  test('accepts +84 phone format', () => expect(validate(CONTACT_RULES, { ...contact, phone: '+84942922000' }).phone).toBeUndefined())
  test('message length bounds', () => {
    expect(validate(CONTACT_RULES, { ...contact, message: 'ngắn' }).message).toMatch(/ít nhất 10/)
    expect(validate(CONTACT_RULES, { ...contact, message: 'x'.repeat(501) }).message).toMatch(/Tối đa 500/)
  })
  test('missing fields are treated as empty', () => expect(Object.keys(validate(CONTACT_RULES, {}))).toEqual(expect.arrayContaining(['name', 'phone', 'email', 'message'])))
})

describe('partner rules', () => {
  test('valid input (email optional)', () => expect(validate(PARTNER_RULES, partner)).toEqual({}))
  test('optional email still validated when present', () => expect(validate(PARTNER_RULES, { ...partner, email: 'bad' }).email).toBeTruthy())
  test('area and partner type must be from the allowed lists', () => {
    expect(validate(PARTNER_RULES, { ...partner, area: 'Mars' }).area).toBeTruthy()
    expect(validate(PARTNER_RULES, { ...partner, partnerType: 'hack' }).partnerType).toBeTruthy()
  })
})
