import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { nav } from '@/test/helpers'
import { Header } from './Header'
import { StoreProvider } from './store'

const props = {
  vehicles: [{ name: 'VinFast VF 5', slug: 'vinfast-vf-5', img: '/car.webp' }],
  systems: [{ name: 'Hệ thống phanh', slug: 'he-thong-phanh' }],
  hotline: '0942.922.000',
  company: 'EVTECH Group',
  tagline: 'Phụ tùng xe điện',
  hasArticles: false,
}
const ui = (p = {}) => render(<StoreProvider><Header {...props} {...p} /></StoreProvider>)

beforeEach(() => {
  nav.push.mockClear()
  nav.pathname = '/'
})
afterEach(() => vi.unstubAllGlobals())

test('nav lists vehicles/systems dropdowns and hides "Bài viết" without articles', () => {
  ui()
  expect(screen.getAllByText('VinFast VF 5')[0].closest('a')!.getAttribute('href')).toBe('/dong-xe/vinfast-vf-5')
  expect(screen.getAllByText('Hệ thống phanh')[0].closest('a')!.getAttribute('href')).toBe('/he-thong/he-thong-phanh')
  expect(screen.queryByText('Bài viết')).toBeNull()
})

test('shows "Bài viết" when articles exist and marks the active section', () => {
  nav.pathname = '/lien-he'
  ui({ hasArticles: true })
  expect(screen.getAllByText('Bài viết').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Liên hệ')[0].className).toContain('active')
})

test('empty quote cart shows a hint instead of navigating', () => {
  ui()
  fireEvent.click(screen.getByLabelText('Danh sách báo giá'))
  expect(screen.getByText(/Danh sách báo giá đang trống/)).toBeTruthy()
  expect(nav.push).not.toHaveBeenCalled()
})

test('search suggests vehicles and products from the API', async () => {
  const fetch = vi.fn(async () => ({ json: async () => ({ docs: [{ slug: 'ma-phanh', name: 'Má phanh VF5', price: 650000, images: [] }] }) }))
  vi.stubGlobal('fetch', fetch)
  ui()
  fireEvent.change(screen.getByLabelText('Tìm phụ tùng'), { target: { value: 'vf 5' } })
  await waitFor(() => expect(screen.getByRole('listbox').textContent).toContain('Má phanh VF5'))
  expect(String(fetch.mock.calls[0][0])).toContain('/api/products?')
  fireEvent.click(screen.getByText('650.000₫'))
  expect(nav.push).toHaveBeenCalledWith('/san-pham/ma-phanh')
})

test('submitting a query goes to the search page', () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ docs: [] }) })))
  ui()
  const input = screen.getByLabelText('Tìm phụ tùng')
  fireEvent.change(input, { target: { value: 'rotuyn' } })
  fireEvent.submit(input.closest('form')!)
  expect(nav.push).toHaveBeenCalledWith('/san-pham?q=rotuyn')
})

test('burger toggles the mobile drawer', () => {
  ui()
  const burger = screen.getByLabelText('Mở menu')
  fireEvent.click(burger)
  expect(burger.getAttribute('aria-expanded')).toBe('true')
  expect(document.querySelector('.drawer.open')).toBeTruthy()
})
