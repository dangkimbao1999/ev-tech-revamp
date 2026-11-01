import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { ContactForm, GaraForm } from './forms'
import { StoreProvider } from './store'

const submitLead = vi.fn()
// A rejecting vi.fn trips vitest's own result tracking, so simulate network failure outside the spy.
let offline = false
vi.mock('@/app/(frontend)/actions', () => ({ submitLead: (...a: unknown[]) => (offline ? Promise.reject(new Error('offline')) : submitLead(...a)) }))

const ui = (node: React.ReactNode) => render(<StoreProvider>{node}</StoreProvider>)
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })
const submit = async (text: string) => act(async () => fireEvent.click(screen.getByText(text)))

beforeEach(() => {
  submitLead.mockReset()
  offline = false
})

test('contact form blocks invalid input client-side', async () => {
  ui(<ContactForm initialMsg="" />)
  await submit('Gửi liên hệ')
  expect(submitLead).not.toHaveBeenCalled()
  expect(screen.getByText(/Vui lòng nhập họ tên/)).toBeTruthy()
  expect(screen.getByText(/Số điện thoại chưa đúng/)).toBeTruthy()
})

test('contact form prefills the message and submits valid data', async () => {
  submitLead.mockResolvedValue({ ok: true })
  ui(<ContactForm initialMsg="Tôi cần tư vấn phụ tùng cho xe Hybrid." />)
  expect((screen.getByLabelText(/^Lời nhắn/) as HTMLTextAreaElement).value).toContain('Hybrid')
  type('Họ tên', 'Khách')
  type('Điện thoại', '0942 922 000')
  type('Email', 'k@example.com')
  await submit('Gửi liên hệ')
  expect(submitLead).toHaveBeenCalledWith('contact', expect.objectContaining({ name: 'Khách', phone: '0942 922 000' }))
  expect(screen.getByText('Cảm ơn Khách!')).toBeTruthy()
})

test('server-side errors are shown on the fields', async () => {
  submitLead.mockResolvedValue({ ok: false, errors: { email: 'Email bị chặn' } })
  ui(<ContactForm initialMsg="Cần báo giá má phanh VF5" />)
  type('Họ tên', 'Khách')
  type('Điện thoại', '0942922000')
  type('Email', 'k@example.com')
  await submit('Gửi liên hệ')
  expect(screen.getByText('Email bị chặn')).toBeTruthy()
})

test('network failure shows a toast instead of crashing', async () => {
  offline = true
  ui(<ContactForm initialMsg="Cần báo giá má phanh VF5" />)
  type('Họ tên', 'Khách')
  type('Điện thoại', '0942922000')
  type('Email', 'k@example.com')
  await submit('Gửi liên hệ')
  expect(screen.getByText(/Gửi không thành công/)).toBeTruthy()
})

test('partner form preselects the type and requires an area', async () => {
  submitLead.mockResolvedValue({ ok: true })
  ui(<GaraForm initialType="Đại lý phân phối" head={<h2>Đăng ký</h2>} />)
  expect(screen.getByRole('radio', { name: 'Đại lý phân phối' }).getAttribute('aria-checked')).toBe('true')
  type('Tên đơn vị', 'Gara A')
  type('Người liên hệ', 'Bình')
  type('Số điện thoại', '0945544000')
  type('Địa chỉ', '12 Tây Mỗ')
  type('Nhu cầu hợp tác', 'Muốn nhập sỉ phụ tùng')
  await submit('Gửi đăng ký')
  expect(submitLead).not.toHaveBeenCalled()
  expect(screen.getByText('Vui lòng chọn khu vực.')).toBeTruthy()
  fireEvent.click(screen.getByText('Chọn tỉnh/thành phố'))
  fireEvent.click(screen.getByText('Hà Nội'))
  await submit('Gửi đăng ký')
  expect(submitLead).toHaveBeenCalledWith('partner', expect.objectContaining({ partnerType: 'Đại lý phân phối', area: 'Hà Nội' }))
  expect(screen.getByText(/Đã nhận đăng ký của Gara A/)).toBeTruthy()
})
