import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import { Ck, Crumb, Trust } from '@/components/shared'
import { Ic } from '@/components/store'
import { BuyBox, Gallery, ProductTabs } from '@/components/widgets'
import { db, fmt, getNav, getSettings, mediaUrl } from '@/lib/data'
import type { Product, System, Vehicle } from '@/payload-types'
import { JsonLd, seo, SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

const getProduct = async (slug: string) =>
  (await (await db()).find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth: 2 })).docs[0] as Product | undefined

export async function generateMetadata({ params }: Props) {
  const p = await getProduct((await params).slug)
  if (!p) return {}
  const cars = (p.vehicles ?? []).flatMap((v) => (typeof v === 'object' ? [v.name] : []))
  return seo(
    `/san-pham/${p.slug}`,
    p.name,
    `${p.name}${p.sku ? ` (mã ${p.sku})` : ''}${cars.length ? `, tương thích ${cars.join(', ')}` : ''}.${p.price ? ` Giá chỉ từ ${fmt(p.price)}.` : ''} Hàng sẵn kho, giao hàng toàn quốc.`,
    mediaUrl(p.images?.[0]),
  )
}

const Spec = ({ rows }: { rows: [string, string][] }) => (
  <dl className="spec">
    {rows.map(([l, v]) => (
      <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
    ))}
  </dl>
)

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug)
  if (!p) notFound()
  const [s, { vehicles: allCars }] = await Promise.all([getSettings(), getNav()])
  const sys = p.system as System
  const cars = (p.vehicles ?? []).filter((v): v is Vehicle => typeof v === 'object')
  const compat = cars.length ? cars.map((v) => v.name) : ['Nhiều dòng xe VinFast']
  const imgs = (p.images ?? []).map(mediaUrl).filter(Boolean) as string[]
  const specs: [string, string][] = [
    ['Mã sản phẩm', p.sku || `EVT-${p.id}`],
    ['Nhóm phụ tùng', sys?.name ?? ''],
    ['Vị trí lắp đặt', p.position || 'Theo vị trí nguyên bản'],
    ['Tình trạng', p.inStock ? 'Còn hàng' : 'Hết hàng'],
    ['Bảo hành', p.warranty || 'Theo chính sách EVTECH'],
    ['Xuất xứ', p.origin || 'Đang cập nhật'],
    ['Tương thích', compat.join(', ')],
  ]
  const related = (
    await (await db()).find({ collection: 'products', where: { and: [{ system: { equals: sys?.id } }, { id: { not_equals: p.id } }] }, limit: 4, depth: 1 })
  ).docs

  const panels = [
    <Fragment key="f0">
      <h3 className="b-lg navy" style={{ margin: 0, fontWeight: 700 }}>{p.name}</h3>
      {p.description ? (
        <RichText data={p.description} className="b-lg rich" />
      ) : (
        <p className="b-lg t2" style={{ margin: 0 }}>
          Phụ tùng thay thế thuộc nhóm {sys?.name.toLowerCase()}, tương thích {compat.join(', ')}. EVTECH tư vấn đúng mã theo số khung xe trước khi giao hàng.
        </p>
      )}
      <Ck sm items={['Kiểm tra chất lượng trước khi xuất kho', 'Tư vấn đúng mã theo số khung xe', 'Giao hàng toàn quốc, đóng gói cẩn thận', 'Hỗ trợ kỹ thuật khi lắp đặt']} />
    </Fragment>,
    <Spec key="s" rows={specs} />,
    <Fragment key="f1">
      <p className="b-md t2" style={{ margin: 0 }}>Bấm vào dòng xe để xem toàn bộ phụ tùng tương thích.</p>
      <div className="compat">
        {allCars.map((c) => {
          const on = cars.some((x) => x.id === c.id)
          const img = mediaUrl(c.image)
          return (
            <Link key={c.id} className={`cchip ${on ? 'on' : ''}`} href={`/dong-xe/${c.slug}`}>
              {img && <img src={img} alt="" />}
              {c.name}
              {on && <b><Ic id="check" />Tương thích</b>}
            </Link>
          )
        })}
      </div>
    </Fragment>,
    <Fragment key="f2">
      <ol className="steps">
        {['Xác định đúng mã phụ tùng theo số khung xe', 'Chuẩn bị dụng cụ, nâng xe và cố định an toàn', 'Tháo phụ tùng cũ theo hướng dẫn của hãng', 'Lắp phụ tùng mới, siết lực đúng thông số', 'Chạy thử và kiểm tra vận hành'].map((x) => <li key={x}>{x}</li>)}
      </ol>
      <p className="b-sm tm" style={{ margin: 0 }}>Khuyến nghị lắp đặt tại gara có kỹ thuật viên xe điện. Liên hệ hotline nếu cần hỗ trợ.</p>
    </Fragment>,
    <p key="w" className="b-lg t2" style={{ margin: 0 }}>
      Sản phẩm được bảo hành {p.warranty ? `${p.warranty} ` : ''}theo chính sách của EVTECH. Vui lòng liên hệ hotline <b className="navy">{s.hotline}</b> để được tư vấn.
    </p>,
  ]

  return (
    <div className="view">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: p.name,
            sku: p.sku || undefined,
            image: imgs.map((u) => (u.startsWith('/') ? SITE_URL + u : u)),
            brand: { '@type': 'Brand', name: 'EVTECH' },
            category: sys?.name,
            description: `${p.name}, tương thích ${compat.join(', ')}.`,
            ...(p.price && {
              offers: { '@type': 'Offer', priceCurrency: 'VND', price: p.price, availability: `https://schema.org/${p.inStock ? 'InStock' : 'OutOfStock'}`, url: `${SITE_URL}/san-pham/${p.slug}` },
            }),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
              ...(sys ? [{ '@type': 'ListItem', position: 2, name: sys.name, item: `${SITE_URL}/he-thong/${sys.slug}` }] : []),
              { '@type': 'ListItem', position: sys ? 3 : 2, name: p.name },
            ],
          },
        ]}
      />
      <div className="wrap" style={{ paddingBlock: 16 }}>
        <Crumb items={[[sys?.name ?? 'Sản phẩm', sys ? `/he-thong/${sys.slug}` : '/san-pham'], [p.name]]} />
      </div>
      <section className="wrap pd-top">
        <div className="pd-gal"><Gallery imgs={imgs} name={p.name} /></div>
        <div className="pd-info">
          <h1 className="h3 navy" style={{ margin: 0 }}>{p.name}</h1>
          <div className="pd-badges">
            <span className="bdg brand">EVTECH</span>
            <span className="bdg soft">Tương thích: {compat[0]}</span>
            {p.inStock && <span className="bdg ok"><Ic id="check" />Còn hàng</span>}
          </div>
          {p.price ? <div className="price"><small>Giá tham khảo</small><b className="pd-price">{fmt(p.price)}</b></div> : null}
          <Spec rows={specs.filter((x) => x[0] !== 'Nhóm phụ tùng')} />
          <p className="b-sm tm" style={{ margin: 0 }}>* Thông số mang tính tham khảo, vui lòng liên hệ để được tư vấn chính xác theo số khung xe.</p>
          <BuyBox c={{ id: p.id, name: p.name }} hotline={s.hotline!} />
        </div>
        <aside className="pd-aside">
          <Trust ic="headset" t="Tư vấn kỹ thuật" d={s.hotline!} />
          <Trust ic="store" t="Hỗ trợ gara, đại lý" d="Chính sách giá tốt" />
          <Trust ic="truck" t="Giao hàng toàn quốc" d="Nhanh chóng – đúng hẹn" />
          <Trust ic="shield" t="Đảm bảo chất lượng" d="Nguồn gốc rõ ràng" />
        </aside>
      </section>
      <section className="wrap pd-bottom">
        <ProductTabs labels={['Mô tả sản phẩm', 'Thông số kỹ thuật', 'Dòng xe tương thích', 'Hướng dẫn lắp đặt', 'Chính sách bảo hành']} panels={panels} />
        <aside className="pd-rel">
          <h2 className="h6 navy" style={{ margin: 0 }}>Sản phẩm liên quan</h2>
          {related.map((r) => {
            const img = mediaUrl(r.images?.[0])
            return (
              <Link key={r.id} className="ritem" href={`/san-pham/${r.slug}`}>
                <span className="ri">{img ? <img src={img} alt="" /> : <Ic id="gear" />}</span>
                <span className="rt"><b>{r.name}</b><small>{r.price ? fmt(r.price) : 'Liên hệ báo giá'}</small></span>
                <Ic id="right" />
              </Link>
            )
          })}
        </aside>
      </section>
    </div>
  )
}
