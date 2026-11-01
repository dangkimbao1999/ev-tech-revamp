import { render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { catalog, fakePayload, PRODUCT, SETTINGS, textOf } from '@/test/helpers'
import { usePayload } from '@/test/payload-slot'
import { ArticleCard, Ck, Crumb, CtaBand, EmptyList, Footer, Help, Listing, SecHead, Services } from './shared'

beforeEach(() => {
  usePayload(fakePayload(catalog(), SETTINGS))
})

test('SecHead renders h1 only when asked', () => {
  const { rerender } = render(<SecHead ov="Ov" t="Phụ tùng" h="VF5" />)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Phụ tùng VF5')
  rerender(<SecHead h1 ov="Ov" t="Phụ tùng" h="VF5" />)
  expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
})

test('Crumb starts at home and links intermediate items', () => {
  render(<Crumb items={[['Hệ thống phanh', '/he-thong/he-thong-phanh'], ['Má phanh']]} />)
  const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
  expect(links).toEqual(['/', '/he-thong/he-thong-phanh'])
  expect(screen.getByText('Má phanh').className).toBe('cur')
})

test('Ck, EmptyList and ArticleCard render their content', () => {
  render(
    <>
      <Ck items={['Hàng chuẩn']} />
      <EmptyList title="Trống" desc="Mô tả" />
      <ArticleCard a={{ slug: 'bai', title: 'Bài viết A', cover: null, publishedAt: '2026-11-01T00:00:00Z' }} />
    </>,
  )
  expect(screen.getByText('Hàng chuẩn')).toBeTruthy()
  expect(screen.getByText('Gửi yêu cầu tìm phụ tùng').closest('a')!.getAttribute('href')).toBe('/lien-he?msg=find')
  expect(screen.getByText('Bài viết A').closest('a')!.getAttribute('href')).toBe('/bai-viet/bai')
})

test('Services lists CMS pages plus contact', async () => {
  const t = textOf(await Services())
  expect(t).toContain('Giới thiệu')
  expect(t).toContain('/gioi-thieu')
  expect(t).toContain('/lien-he')
})

test('Help and CtaBand use the hotline from settings', async () => {
  expect(textOf(await Help())).toContain('0942.922.000')
  expect(textOf(await CtaBand())).toContain('Gọi 0942.922.000')
})

test('Footer shows company contacts and hides "Bài viết" when there are none', async () => {
  usePayload(fakePayload({ ...catalog(), articles: [] }, SETTINGS))
  const t = textOf(await Footer())
  expect(t).toContain('Xuân Phương, Hà Nội')
  expect(t).toContain('0942.922.000 – 0945.544.000')
  expect(t).not.toContain('/bai-viet')
})

test('Listing queries products and builds pagination links that keep filters', async () => {
  const many = Array.from({ length: 13 }, (_, i) => ({ ...PRODUCT, id: i + 1, slug: `p${i}` }))
  const p = usePayload(fakePayload({ ...catalog(), products: many }, SETTINGS))
  const el = await Listing({ where: {}, sp: { sort: 'asc', q: 'phanh' }, basePath: '/san-pham', hero: 'H', side: 'S', label: 'L', empty: 'E' })
  const t = textOf(el)
  expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'products', sort: 'price', page: 1, limit: 12 }))
  expect(t).toContain('13 sản phẩm')
  expect(t).toContain('/san-pham?sort=asc&q=phanh&page=2')
})

test('Listing shows the empty state when nothing matches', async () => {
  usePayload(fakePayload({ ...catalog(), products: [] }, SETTINGS))
  const t = textOf(await Listing({ where: {}, sp: {}, basePath: '/x', hero: '', side: '', label: '', empty: 'NO-RESULTS' }))
  expect(t).toContain('NO-RESULTS')
})
