import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { nav } from '@/test/helpers'
import { CopyBtn, PhoneBtn, ProductCard, StoreProvider } from './store'

const card = { id: 1, slug: 'ma-phanh', name: 'Má phanh VF5', price: 650000, img: '/a.webp', cat: 'Hệ thống phanh', sysSlug: 'he-thong-phanh' }
const ui = (node: React.ReactNode) => render(<StoreProvider>{node}</StoreProvider>)
const inCard = () => within(document.querySelector<HTMLElement>('.pcard')!)

beforeEach(() => nav.push.mockClear())

test('price card links to the product and shows formatted price', () => {
  ui(<ProductCard c={card} />)
  expect(screen.getByText('650.000₫')).toBeTruthy()
  expect(screen.getAllByRole('link').every((a) => a.getAttribute('href') === '/san-pham/ma-phanh')).toBe(true)
})

test('quote card goes to the contact form with the part name prefilled', () => {
  ui(<ProductCard c={card} quote />)
  fireEvent.click(inCard().getByText('Liên hệ báo giá'))
  expect(decodeURIComponent(nav.push.mock.calls[0][0])).toBe('/lien-he?msg=Tôi cần báo giá: Má phanh VF5.#cform')
  expect(screen.getByText(/Đã điền sẵn tên phụ tùng/)).toBeTruthy() // toast
})

test('favourite toggles and persists', () => {
  ui(<ProductCard c={card} />)
  const fav = screen.getByLabelText('Yêu thích')
  fireEvent.click(fav)
  expect(fav.getAttribute('aria-pressed')).toBe('true')
  expect(JSON.parse(localStorage.getItem('evt-favs')!)).toEqual([1])
  fireEvent.click(fav)
  expect(fav.getAttribute('aria-pressed')).toBe('false')
})

test('quick view opens a modal and asks for a quote', () => {
  ui(<ProductCard c={card} />)
  fireEvent.click(screen.getByText('Xem nhanh'))
  expect(document.querySelector('.modal.open')).toBeTruthy()
  fireEvent.click(within(document.querySelector<HTMLElement>('.modal')!).getByText('Liên hệ báo giá'))
  expect(decodeURIComponent(nav.push.mock.calls[0][0])).toContain('Tôi cần báo giá: Má phanh VF5.')
  expect(document.querySelector('.modal.open')).toBeNull()
})

test('missing image shows a placeholder', () => {
  ui(<ProductCard c={{ ...card, img: null, price: null }} />)
  expect(screen.getByLabelText('Ảnh sản phẩm đang cập nhật')).toBeTruthy()
  expect(inCard().getByText('Liên hệ báo giá')).toBeTruthy()
})

const touch = (on: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: on }))

test('PhoneBtn is a tel: link that lets touch devices dial directly', () => {
  touch(true)
  const writeText = vi.fn(async () => {})
  Object.assign(navigator, { clipboard: { writeText } })
  ui(<PhoneBtn num="0942.922.000" />)
  const a = screen.getByText('0942.922.000')
  expect(a.getAttribute('href')).toBe('tel:0942922000')
  const ev = new MouseEvent('click', { bubbles: true, cancelable: true })
  a.dispatchEvent(ev)
  expect(ev.defaultPrevented).toBe(false) // browser follows tel: → dialer
  expect(writeText).not.toHaveBeenCalled()
})

test('PhoneBtn copies the number on desktop instead of dialing', async () => {
  touch(false)
  const writeText = vi.fn(async () => {})
  Object.assign(navigator, { clipboard: { writeText } })
  ui(<PhoneBtn num="0942.922.000" />)
  const ev = new MouseEvent('click', { bubbles: true, cancelable: true })
  await act(async () => void screen.getByText('0942.922.000').dispatchEvent(ev))
  expect(ev.defaultPrevented).toBe(true)
  expect(writeText).toHaveBeenCalledWith('0942.922.000')
})

test('CopyBtn copies and confirms', async () => {
  const writeText = vi.fn(async () => {})
  Object.assign(navigator, { clipboard: { writeText } })
  ui(<CopyBtn text="0942.922.000" />)
  await act(async () => fireEvent.click(screen.getByText('Sao chép')))
  expect(writeText).toHaveBeenCalledWith('0942.922.000')
  expect(screen.getByText('Đã chép')).toBeTruthy()
})
