import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { nav } from '@/test/helpers'
import { StoreProvider } from './store'
import { BuyBox, FeaturedTabs, Gallery, ProductTabs, QSel, QuickSearch, SortSelect } from './widgets'

const ui = (node: React.ReactNode) => render(<StoreProvider>{node}</StoreProvider>)
const vehicles = [{ name: 'VinFast VF 5', slug: 'vinfast-vf-5' }]
const systems = [{ name: 'Hệ thống phanh', slug: 'he-thong-phanh' }]
const card = (id: number, cat: string) => ({ id, slug: `p${id}`, name: `SP ${id}`, price: 1000, img: null, cat, sysSlug: '' })

beforeEach(() => {
  nav.push.mockClear()
  nav.pathname = '/dong-xe/vinfast-vf-5'
  nav.search = 'page=2&q=phanh'
})

test('QSel opens, selects an option and closes', () => {
  let v = ''
  render(<QSel ph="Chọn" opts={['A', 'B']} value="" onChange={(x) => (v = x)} />)
  fireEvent.click(screen.getByText('Chọn'))
  fireEvent.click(screen.getByText('B'))
  expect(v).toBe('B')
})

test('QuickSearch requires some input', () => {
  ui(<QuickSearch vehicles={vehicles} systems={systems} />)
  fireEvent.click(screen.getByText('Tìm kiếm'))
  expect(nav.push).not.toHaveBeenCalled()
  expect(screen.getByText(/Chọn dòng xe, hệ thống/)).toBeTruthy()
})

test('QuickSearch routes by vehicle + system + keyword', () => {
  ui(<QuickSearch vehicles={vehicles} systems={systems} />)
  fireEvent.click(screen.getByText('Chọn dòng xe'))
  fireEvent.click(screen.getByText('VinFast VF 5'))
  fireEvent.click(screen.getByText('Chọn hệ thống phụ tùng'))
  fireEvent.click(screen.getAllByText('Hệ thống phanh').at(-1)!)
  fireEvent.change(screen.getByLabelText('Từ khoá'), { target: { value: 'má' } })
  fireEvent.click(screen.getByText('Tìm kiếm'))
  expect(nav.push).toHaveBeenCalledWith('/dong-xe/vinfast-vf-5?q=m%C3%A1&he-thong=he-thong-phanh')
})

test('QuickSearch "by code" searches all products', () => {
  ui(<QuickSearch vehicles={vehicles} systems={systems} />)
  fireEvent.click(screen.getByText('Theo mã sản phẩm'))
  fireEvent.change(screen.getByLabelText('Từ khoá'), { target: { value: 'EVT-19' } })
  fireEvent.click(screen.getByText('Tìm kiếm'))
  expect(nav.push).toHaveBeenCalledWith('/san-pham?q=EVT-19')
})

test('FeaturedTabs filters by system and shows an empty state', () => {
  ui(<FeaturedTabs tabs={['Hệ thống phanh', 'Giảm xóc']} cards={[card(1, 'Hệ thống phanh'), card(2, 'Gầm lái')]} />)
  expect(screen.getByText('SP 1')).toBeTruthy()
  expect(screen.getByText('SP 2')).toBeTruthy()
  fireEvent.click(screen.getByRole('tab', { name: 'Hệ thống phanh' }))
  expect(screen.queryByText('SP 2')).toBeNull()
  fireEvent.click(screen.getByRole('tab', { name: 'Giảm xóc' }))
  expect(screen.getByText(/đang được cập nhật/)).toBeTruthy()
})

test('SortSelect keeps other params, resets page', () => {
  render(<SortSelect value="new" options={[['new', 'Mới nhất'], ['asc', 'Giá tăng dần']]} />)
  fireEvent.click(screen.getByRole('button', { name: /Sắp xếp/ }))
  fireEvent.click(screen.getByText('Giá tăng dần'))
  expect(nav.push).toHaveBeenCalledWith('/dong-xe/vinfast-vf-5?q=phanh&sort=asc', { scroll: false })
})

test('Gallery switches images via thumbnails; no images -> placeholder', () => {
  const { rerender } = render(<Gallery imgs={['/a.webp', '/b.webp']} name="SP" />)
  expect(screen.getByAltText('SP').getAttribute('src')).toBe('/a.webp')
  fireEvent.click(screen.getByLabelText('Ảnh 2'))
  expect(screen.getByAltText('SP').getAttribute('src')).toBe('/b.webp')
  rerender(<Gallery imgs={[]} name="SP" />)
  expect(screen.getByText('Ảnh đang cập nhật')).toBeTruthy()
})

test('ProductTabs shows one panel at a time', () => {
  render(<ProductTabs labels={['Mô tả', 'Thông số']} panels={['Panel A', 'Panel B']} />)
  expect(screen.getByRole('tabpanel').textContent).toBe('Panel A')
  fireEvent.click(screen.getByText('Thông số'))
  expect(screen.getByRole('tabpanel').textContent).toBe('Panel B')
})

test('BuyBox adds the chosen quantity and can request a quote', () => {
  ui(<BuyBox c={{ id: 9, name: 'Má phanh' }} hotline="0942.922.000" />)
  const box = within(document.querySelector<HTMLElement>('.pd-buy')!)
  fireEvent.click(box.getByLabelText('Tăng'))
  fireEvent.click(box.getByText('Liên hệ báo giá'))
  expect(JSON.parse(localStorage.getItem('evt-quote')!)).toEqual({ 9: { name: 'Má phanh', qty: 2 } })
  fireEvent.click(screen.getByText('Gửi yêu cầu báo giá'))
  expect(decodeURIComponent(nav.push.mock.calls[0][0])).toBe('/lien-he?msg=Tôi cần báo giá: Má phanh × 2.')
})
