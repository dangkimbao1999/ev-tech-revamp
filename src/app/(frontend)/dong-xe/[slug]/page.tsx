import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crumb, EmptyList, Listing, SecHead } from '@/components/shared'
import { Ic } from '@/components/store'
import { andWhere, getNav, type ListSP, mediaUrl } from '@/lib/data'
import { seo } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }>; searchParams: ListSP }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const v = (await getNav()).vehicles.find((x) => x.slug === slug)
  if (!v) return {}
  return seo(`/dong-xe/${slug}`, `Phụ tùng tương thích ${v.name}`, `Phụ tùng thay thế tương thích ${v.name}: má phanh, giảm xóc, gầm lái, điều hòa, cáp sạc… Hàng sẵn kho, giá tốt, giao hàng toàn quốc. Hotline 0942.922.000.`, mediaUrl(v.image))
}

export default async function ByVehicle({ params, searchParams }: Props) {
  const [{ slug }, sp, { vehicles, systems }] = await Promise.all([params, searchParams, getNav()])
  const v = vehicles.find((x) => x.slug === slug)
  if (!v) notFound()
  const sys = systems.find((s) => s.slug === sp['he-thong'])
  const img = mediaUrl(v.image)
  return (
    <Listing
      where={andWhere(sp.q, { vehicles: { contains: v.id } }, ...(sys ? [{ system: { equals: sys.id } }] : []))}
      sp={sp}
      basePath={`/dong-xe/${slug}`}
      label={v.name}
      hero={
        <>
          <Crumb items={[['Phụ tùng theo dòng xe'], [v.name]]} />
          <div className="row">
            <SecHead h1 ov="Phụ tùng theo dòng xe" t="Phụ tùng tương thích" h={v.name} desc={`Phụ tùng thay thế chính hãng, tương thích chuẩn cho ${v.name} – giao nhanh toàn quốc.`} />
            <div className="veh">{img && <img src={img} alt={v.name} />}</div>
          </div>
        </>
      }
      side={
        <div className="box">
          <span className="overline">Danh mục sản phẩm</span>
          {vehicles.map((x) => (
            <Link key={x.id} className={`side-item ${x.id === v.id ? 'on' : ''}`} href={`/dong-xe/${x.slug}`} aria-current={x.id === v.id ? 'page' : undefined}>
              {x.name}<Ic id="right" />
            </Link>
          ))}
        </div>
      }
      empty={<EmptyList title={`Chưa có sản phẩm cho ${v.name}${sp.q ? ` khớp “${sp.q}”` : ''}`} desc="Gửi yêu cầu để EVTECH tìm đúng mã phụ tùng cho xe của bạn." />}
    />
  )
}
