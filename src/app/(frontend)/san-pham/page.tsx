import Link from 'next/link'
import { Crumb, EmptyList, Listing, SecHead } from '@/components/shared'
import { Ic } from '@/components/store'
import { andWhere, getNav, type ListSP } from '@/lib/data'
import { seo } from '@/lib/seo'

export async function generateMetadata({ searchParams }: { searchParams: ListSP }) {
  const { q } = await searchParams
  // Search result pages: don't index, but follow links to products.
  return { ...seo('/san-pham', 'Tra cứu phụ tùng xe điện'), ...(q ? { robots: { index: false, follow: true } } : {}) }
}

export default async function AllProducts({ searchParams }: { searchParams: ListSP }) {
  const [sp, { vehicles }] = await Promise.all([searchParams, getNav()])
  const q = sp.q?.trim()
  return (
    <Listing
      where={andWhere(q)}
      sp={sp}
      basePath="/san-pham"
      label={q ? `Kết quả cho “${q}”` : 'Tất cả sản phẩm'}
      hero={
        <>
          <Crumb items={[['Tra cứu phụ tùng']]} />
          <div style={{ marginTop: 24 }}>
            <SecHead h1 ov="Tra cứu phụ tùng" t={q ? 'Kết quả cho' : 'Tất cả'} h={q ? `“${q}”` : 'sản phẩm'} desc="Phụ tùng thay thế tương thích các dòng xe VinFast, giao nhanh toàn quốc." />
          </div>
        </>
      }
      side={
        <div className="box">
          <span className="overline">Theo dòng xe</span>
          {vehicles.map((x) => (
            <Link key={x.id} className="side-item" href={`/dong-xe/${x.slug}${q ? `?q=${encodeURIComponent(q)}` : ''}`}>{x.name}<Ic id="right" /></Link>
          ))}
        </div>
      }
      empty={<EmptyList title={`Không tìm thấy “${q}”`} desc="Gửi yêu cầu để EVTECH tìm đúng mã phụ tùng cho xe của bạn." />}
    />
  )
}
