import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crumb, EmptyList, Listing, SecHead } from '@/components/shared'
import { Ic } from '@/components/store'
import { andWhere, db, getNav, type ListSP, mediaUrl } from '@/lib/data'
import { seo } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }>; searchParams: ListSP }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const s = (await getNav()).systems.find((x) => x.slug === slug)
  if (!s) return {}
  return seo(`/he-thong/${slug}`, `Phụ tùng ${s.name} xe điện VinFast`, `Phụ tùng ${s.name.toLowerCase()} tương thích xe ô tô điện VinFast${s.description ? ': ' + s.description.replace(/…$/, '') : ''}. Hàng sẵn kho, giao hàng toàn quốc.`, mediaUrl(s.image))
}

export default async function BySystem({ params, searchParams }: Props) {
  const [{ slug }, sp, { systems }] = await Promise.all([params, searchParams, getNav()])
  const sy = systems.find((x) => x.slug === slug)
  if (!sy) notFound()
  const p = await db()
  const counts = await Promise.all(systems.map((s) => p.count({ collection: 'products', where: { system: { equals: s.id } } })))
  const img = mediaUrl(sy.image)
  const d = (sy.description || '').replace(/…$/, '')
  return (
    <Listing
      where={andWhere(sp.q, { system: { equals: sy.id } })}
      sp={sp}
      basePath={`/he-thong/${slug}`}
      label={sy.name}
      hero={
        <>
          <Crumb items={[['Phụ tùng theo hệ thống'], [sy.name]]} />
          <div className="row">
            <SecHead h1 ov="Phụ tùng theo hệ thống" t="Phụ tùng" h={sy.name} desc={`${d ? d + ' – ' : ''}phụ tùng thay thế tương thích các dòng xe VinFast, giao nhanh toàn quốc.`} />
            <div className="veh sysv">{img ? <img src={img} alt={sy.name} /> : <div className="noimg"><Ic id="gear" /><span>Ảnh đang cập nhật</span></div>}</div>
          </div>
        </>
      }
      side={
        <div className="box">
          <span className="overline">Danh mục sản phẩm</span>
          {systems.map((x, i) => (
            <Link key={x.id} className={`side-item ${x.id === sy.id ? 'on' : ''}`} href={`/he-thong/${x.slug}`} aria-current={x.id === sy.id ? 'page' : undefined}>
              {x.name}<span className="cnt">{counts[i].totalDocs}</span><Ic id="right" />
            </Link>
          ))}
        </div>
      }
      empty={<EmptyList title={`Nhóm “${sy.name}” đang cập nhật sản phẩm`} desc={`Gửi yêu cầu để EVTECH tìm đúng mã phụ tùng ${d.toLowerCase()} cho xe của bạn.`} />}
    />
  )
}
