import Link from 'next/link'
import { ArticleCard, Arr, Ck, SecHead, Trust } from '@/components/shared'
import { Ic } from '@/components/store'
import { FeaturedTabs, QuickSearch } from '@/components/widgets'
import { db, getNav, mediaUrl, toCard } from '@/lib/data'


export const metadata = { alternates: { canonical: '/' } }

export default async function Home() {
  const p = await db()
  const [{ vehicles, systems }, featured, arts] = await Promise.all([
    getNav(),
    p.find({ collection: 'products', where: { featured: { equals: true } }, limit: 40, depth: 1 }),
    p.find({ collection: 'articles', limit: 4, depth: 1, overrideAccess: false }),
  ])
  const named = (xs: { name: string; slug?: string | null }[]) => xs.map((x) => ({ name: x.name, slug: x.slug! }))

  return (
    <div className="view">
      <section className="hero2" id="about" aria-label="Giải pháp phụ tùng thay thế cho xe điện">
        <div className="wrap">
          <div>
            <h1>Giải pháp phụ tùng thay thế cho <span className="g">xe điện</span></h1>
            <Ck items={['Sản phẩm chất lượng, nguồn gốc rõ ràng', 'Tương thích nhiều dòng xe', 'Hỗ trợ kỹ thuật – tư vấn nhanh', 'Phục vụ gara, đại lý và chủ xe toàn quốc']} />
            <a className="btn green lg" href="#quick">Tra cứu phụ tùng ngay<Arr /></a>
          </div>
        </div>
        <span className="tag t1"><Ic id="check" />{vehicles.length} dòng xe VinFast</span>
        <span className="tag t2"><Ic id="truck" />Giao hàng toàn quốc</span>
      </section>

      <div className="wrap">
        <div className="trustbar">
          <Trust ic="cart" t="Sản phẩm đa dạng" d="Tương thích nhiều dòng xe" />
          <Trust ic="headset" t="Hỗ trợ kỹ thuật" d="Tư vấn chuyên nghiệp" />
          <Trust ic="shield" t="Chính sách đại lý hấp dẫn" d="Giá tốt – hỗ trợ lâu dài" />
          <Trust ic="truck" t="Giao hàng toàn quốc" d="Nhanh chóng – đúng hẹn" />
        </div>
        <QuickSearch vehicles={named(vehicles)} systems={named(systems)} />
      </div>

      <section className="sec2" id="cars" style={{ paddingBottom: 48 }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="head-row">
            <SecHead ov="Danh mục dòng xe" t="Chọn" h="dòng xe" />
          </div>
          <div className="grid5">
            {vehicles.map((v) => {
              const img = mediaUrl(v.image)
              return (
                <Link key={v.id} className="vcard reveal" href={`/dong-xe/${v.slug}`}>
                  <div className="img">{img ? <img src={img} alt={v.name} loading="lazy" /> : <svg className="ph"><use href="#i-gear" /></svg>}</div>
                  <div className="body">
                    <div className="info"><div className="nm">{v.name}</div><div className="meta">Xem phụ tùng</div></div>
                    <span className="circle"><Ic id="arrow" /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="sec2" id="systems" style={{ paddingTop: 48 }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="head-row">
            <SecHead ov="Danh mục phụ tùng" t="Phụ tùng theo" h="hệ thống" />
            {systems[0] && <Link className="link-arrow" href={`/he-thong/${systems[0].slug}`}><span>Xem tất cả danh mục</span><Ic id="arrow" /></Link>}
          </div>
          <div className="grid4">
            {systems.map((s) => {
              const img = mediaUrl(s.image)
              return (
                <Link key={s.id} className="scard reveal" href={`/he-thong/${s.slug}`} aria-label={`Phụ tùng ${s.name}`}>
                  <div className="img">{img ? <img src={img} alt={s.name} loading="lazy" /> : <svg className="ph"><use href="#i-gear" /></svg>}</div>
                  <div className="body">
                    <div className="t"><div className="nm">{s.name}</div><div className="ds">{s.description}</div></div>
                    <span className="circle"><Ic id="arrow" /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="sec2" id="featured" style={{ background: 'var(--sky)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div className="head-row">
            <SecHead ov="Sản phẩm nổi bật" t="Được lựa chọn" h="nhiều nhất" />
            <Link className="link-arrow" href="/san-pham"><span>Xem tất cả sản phẩm</span><Ic id="arrow" /></Link>
          </div>
          <FeaturedTabs tabs={systems.map((s) => s.name)} cards={featured.docs.map(toCard)} />
        </div>
      </section>

      <section id="gara" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="gara reveal">
            <div className="c">
              <div>
                <div className="ov">Hợp tác cùng EVTECH</div>
                <h2 className="h3" style={{ margin: '6px 0 0' }}>Dành cho Gara & Đại lý</h2>
              </div>
              <Ck items={['Báo giá sỉ nhanh chóng', 'Hỗ trợ tư vấn kỹ thuật', 'Chính sách chiết khấu hấp dẫn', 'Đồng hành cùng gara trên toàn quốc']} />
              <div className="actions">
                <Link className="btn white lg" href="/gara-dai-ly">Tìm hiểu thêm</Link>
                <Link className="btn green lg" href="/gara-dai-ly#register">Đăng ký hợp tác<Arr /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {arts.docs.length > 0 && (
        <section className="sec2" id="news" style={{ paddingBottom: 96 }}>
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="head-row">
              <SecHead ov="Bài viết" t="Kiến thức kỹ thuật" h="& tin tức" />
              <Link className="link-arrow" href="/bai-viet"><span>Xem tất cả bài viết</span><Ic id="arrow" /></Link>
            </div>
            <div className="grid4" style={{ gap: 24 }}>
              {arts.docs.map((a) => <ArticleCard key={a.id} a={a} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
