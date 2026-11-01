import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { nav } from '@/test/helpers'
import { CopyBtn, ProductCard, Qty, quoteMessage, StoreProvider } from './store'

const card = { id: 1, slug: 'ma-phanh', name: 'Má phanh VF5', price: 650000, img: '/a.webp', cat: 'Hệ thống phanh', sysSlug: 'he-thong-phanh' }
const ui = (node: React.ReactNode) => render(<StoreProvider>{node}</StoreProvider>)
const inCard = () => within(document.querySelector<HTMLElement>('.pcard')!)

beforeEach(() => nav.push.mockClear())

test('price card links to the product and shows formatted price', () => {
  ui(<ProductCard c={card} />)
  expect(screen.getByText('650.000₫')).toBeTruthy()
  expect(screen.getAllByRole('link').every((a) => a.getAttribute('href') === '/san-pham/ma-phanh')).toBe(true)
})

test('quote card adds to the quote list and persists it', () => {
  ui(<ProductCard c={card} quote />)
  fireEvent.click(inCard().getByText('Liên hệ báo giá'))
  expect(inCard().getByText('Đã thêm báo giá')).toBeTruthy()
  expect(screen.getByText(/Đã thêm vào danh sách báo giá/)).toBeTruthy() // toast
  expect(JSON.parse(localStorage.getItem('evt-quote')!)).toEqual({ 1: { name: 'Má phanh VF5', qty: 1 } })
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

test('quick view opens a modal and "order" goes to contact with a prefilled message', () => {
  ui(<ProductCard c={card} />)
  fireEvent.click(screen.getByText('Xem nhanh'))
  expect(document.querySelector('.modal.open')).toBeTruthy()
  fireEvent.click(screen.getByLabelText('Tăng'))
  fireEvent.click(screen.getByText('Liên hệ đặt hàng'))
  expect(decodeURIComponent(nav.push.mock.calls[0][0])).toContain('Tôi muốn đặt 2 × Má phanh VF5')
  expect(document.querySelector('.modal.open')).toBeNull()
})

test('missing image shows a placeholder', () => {
  ui(<ProductCard c={{ ...card, img: null, price: null }} />)
  expect(screen.getByLabelText('Ảnh sản phẩm đang cập nhật')).toBeTruthy()
  expect(inCard().getByText('Liên hệ báo giá')).toBeTruthy()
})

test('Qty clamps between 1 and 99', () => {
  const set = vi.fn()
  const { rerender } = render(<Qty v={1} set={set} />)
  fireEvent.click(screen.getByLabelText('Giảm'))
  expect(set).toHaveBeenLastCalledWith(1)
  rerender(<Qty v={99} set={set} />)
  fireEvent.click(screen.getByLabelText('Tăng'))
  expect(set).toHaveBeenLastCalledWith(99)
})

test('CopyBtn copies and confirms', async () => {
  const writeText = vi.fn(async () => {})
  Object.assign(navigator, { clipboard: { writeText } })
  ui(<CopyBtn text="0942.922.000" />)
  await act(async () => fireEvent.click(screen.getByText('Sao chép')))
  expect(writeText).toHaveBeenCalledWith('0942.922.000')
  expect(screen.getByText('Đã chép')).toBeTruthy()
})

test('quoteMessage lists items with quantities', () => {
  expect(quoteMessage({ 1: { name: 'A', qty: 2 }, 2: { name: 'B', qty: 1 } })).toBe('Tôi cần báo giá các phụ tùng sau:\n- A × 2\n- B × 1')
})
