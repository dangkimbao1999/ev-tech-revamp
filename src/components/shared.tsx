import Link from 'next/link'
import type { Where } from 'payload'
import { countArticles, db, getNav, getSettings, mediaUrl, PAGE_SIZE, SORTS, toCard } from '@/lib/data'
import { CopyBtn, Ic, ProductCard } from './store'
import { SortSelect } from './widgets'

export const Arr = () => <Ic id="arrow" cls="arr" />

export const SecHead = ({ ov, t, h, desc, center, h1 }: { ov: string; t: string; h: string; desc?: string; center?: boolean; h1?: boolean }) => {
  const H = h1 ? 'h1' : 'h2'
  return (
  <div className={`sec-head ${center ? 'center' : ''}`}>
    <span className="overline">{ov}</span>
    <H className="h2 navy" style={{ margin: 0 }}>
      {t} <span className="hl">{h}</span>
    </H>
    {desc && <p className="desc" style={{ margin: 0 }}>{desc}</p>}
  </div>
  )
}

export const Trust = ({ ic, t, d, copy }: { ic: string; t: string; d: string; copy?: string }) => (
  <div className="trust">
    <span className="ib"><Ic id={ic} /></span>
    <div style={{ minWidth: 0 }}>
      <div className="tt">{t}</div>
      <div className="td">{d}</div>
    </div>
    {copy && <CopyBtn text={copy} />}
  </div>
)

export const Crumb = ({ items }: { items: [string, string?][] }) => (
  <nav className="crumb" aria-label="Breadcrumb">
    <Link href="/">Trang chủ</Link>
    {items.map(([label, href]) => (
      <span key={label} style={{ display: 'contents' }}>
        <Ic id="right" />
        {href ? <Link href={href}>{label}</Link> : <span className="cur">{label}</span>}
      </span>
    ))}
  </nav>
)

/** Sidebar links to the CMS content pages (Giới thiệu, Hướng dẫn đặt hàng, …). */
export async function Services() {
  const { docs } = await (await db()).find({ collection: 'pages', limit: 20, depth: 0, select: { title: true, slug: true } })
  return (
    <div className="box">
      <span className="overline">Dịch vụ</span>
      {docs.map((p) => (
        <Link key={p.id} className="side-item" href={`/${p.slug}`}>{p.title}<Ic id="right" /></Link>
      ))}
      <Link className="side-item" href="/lien-he">Liên hệ<Ic id="right" /></Link>
    </div>
  )
}

export async function Help() {
  const s = await getSettings()
  return (
    <div className="help">
      <Ic id="headset" cls="big" />
      <div className="h6">Cần tư vấn phụ tùng?</div>
      <p style={{ margin: 0 }}>Gửi số khung hoặc mô tả, kỹ thuật viên sẽ tư vấn đúng mã phụ tùng.</p>
      <CopyBtn text={s.hotline!} className="btn white block">{s.hotline}</CopyBtn>
    </div>
  )
}

export async function CtaBand() {
  const s = await getSettings()
  return (
    <section style={{ paddingBottom: 96 }}>
      <div className="wrap">
        <div className="cta-band reveal">
          <div className="t">
            <h2 className="h3" style={{ margin: 0 }}>Không tìm thấy phụ tùng bạn cần?</h2>
            <p className="b-lg" style={{ marginBottom: 0 }}>Gửi yêu cầu, EVTECH sẽ tìm đúng mã phụ tùng và báo giá cho bạn trong thời gian sớm nhất.</p>
          </div>
          <div className="actions">
            <CopyBtn text={s.hotline!} className="btn white lg">Gọi {s.hotline}</CopyBtn>
            <Link className="btn green lg" href="/lien-he?msg=find">Gửi yêu cầu<Arr /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

type SP = { sort?: string; page?: string; q?: string }

/** Product listing page body: sidebar + toolbar + grid + pager + CTA. */
export async function Listing({ where, sp, basePath, hero, side, label, empty }: { where: Where; sp: SP; basePath: string; hero: React.ReactNode; side: React.ReactNode; label: string; empty: React.ReactNode }) {
  const sort = SORTS.find((s) => s[0] === sp.sort) ?? SORTS[0]
  const page = Math.max(1, Number(sp.page) || 1)
  const res = await (await db()).find({ collection: 'products', where, sort: sort[2], page, limit: PAGE_SIZE, depth: 1 })
  const href = (p: number) => {
    const u = new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][])
    return `${basePath}?${u}`
  }
  return (
    <div className="view">
      <section className="page-hero"><div className="wrap">{hero}</div></section>
      <div className="wrap layout">
        <aside className="side">
          {side}
          <Services />
          <Help />
        </aside>
        <div className="content">
          <div className="toolbar">
            <span className="t2">
              Hiển thị <b>{res.totalDocs} sản phẩm</b> · {res.totalPages > 1 ? `Trang ${page}/${res.totalPages}` : label}
            </span>
            <SortSelect value={sort[0]} options={SORTS.map(([k, l]) => [k, l])} />
          </div>
          <div className="p-grid c3i fade">
            {res.docs.length ? res.docs.map((p) => <ProductCard key={p.id} c={toCard(p)} />) : empty}
          </div>
          {res.totalPages > 1 && (
            <nav className="pager" aria-label="Phân trang">
              {res.hasPrevPage ? <Link className="pg" href={href(page - 1)} aria-label="Trang trước"><Ic id="left" /></Link> : <button className="pg" disabled><Ic id="left" /></button>}
              {Array.from({ length: res.totalPages }, (_, i) => i + 1).map((n) => (
                <Link key={n} className={`pg ${n === page ? 'on' : ''}`} href={href(n)} aria-current={n === page ? 'page' : undefined}>{n}</Link>
              ))}
              {res.hasNextPage ? <Link className="pg" href={href(page + 1)} aria-label="Trang sau"><Ic id="right" /></Link> : <button className="pg" disabled><Ic id="right" /></button>}
            </nav>
          )}
        </div>
      </div>
      <CtaBand />
    </div>
  )
}

export const EmptyList = ({ title, desc }: { title: string; desc: string }) => (
  <div className="empty">
    <Ic id="gear" cls="big" />
    <div className="h6 navy">{title}</div>
    <p className="b-md t2" style={{ margin: 0 }}>{desc}</p>
    <Link className="btn green" href="/lien-he?msg=find">Gửi yêu cầu tìm phụ tùng<Arr /></Link>
  </div>
)

export async function Footer() {
  const [s, { vehicles }, hasArticles] = await Promise.all([getSettings(), getNav(), countArticles()])
  return (
    <footer>
      <div className="wrap">
        <div className="f-top">
          <div className="f-brand">
            <img src="/img/logo_white.png" alt="EVTECH.vn" />
            <p className="b-md" style={{ opacity: 0.85, margin: 0 }}>{s.intro}</p>
            <div className="f-row"><Ic id="pin" /><span>Trụ sở: {s.address}</span></div>
            <div className="f-row"><Ic id="phone" /><span>Hotline/Zalo: {[s.hotline, s.hotline2].filter(Boolean).join(' – ')}</span></div>
            <div className="f-row"><Ic id="mail" /><span>{s.email} · {s.website}</span></div>
            <div className="social">
              {s.socials?.map((x) => <a key={x.id} href={x.url} target="_blank" rel="noopener noreferrer">{x.label}</a>)}
            </div>
          </div>
          <div className="f-col">
            <h4>Dành cho khách hàng</h4>
            <Link href={vehicles[0] ? `/dong-xe/${vehicles[0].slug}` : '/san-pham'}>Phụ tùng theo xe</Link>
            <Link href="/lien-he?msg=hybrid">Phụ tùng Hybrid</Link>
            <Link href="/san-pham">Tra cứu phụ tùng</Link>
            <Link href="/lien-he">Tra cứu bảo hành</Link>
          </div>
          <div className="f-col">
            <h4>Dành cho đại lý</h4>
            <Link href="/gara-dai-ly#register">Đăng ký đại lý</Link>
            <Link href="/gara-dai-ly">Chính sách giá sỉ</Link>
            <Link href="/lien-he">Hỗ trợ kỹ thuật</Link>
          </div>
          <div className="f-col">
            <h4>Về EVTECH</h4>
            <Link href="/gioi-thieu">Giới thiệu</Link>
            <Link href="/huong-dan-dat-hang">Hướng dẫn đặt hàng</Link>
            <Link href="/thanh-toan-giao-hang">Thanh toán & giao hàng</Link>
            {hasArticles && <Link href="/bai-viet">Bài viết</Link>}
            <Link href="/lien-he">Liên hệ</Link>
          </div>
        </div>
        <div className="f-bot">
          <span>© {new Date().getFullYear()} EVTECH Group. All rights reserved.</span>
          <span>Điều khoản sử dụng · Chính sách bảo mật</span>
        </div>
      </div>
    </footer>
  )
}

export const Ck = ({ items, sm }: { items: string[]; sm?: boolean }) => (
  <ul className={`ck ${sm ? 'sm' : ''}`}>
    {items.map((t) => (
      <li key={t}><i><Ic id="check" /></i>{t}</li>
    ))}
  </ul>
)

export function ArticleCard({ a }: { a: { slug?: string | null; title: string; cover?: unknown; publishedAt?: string | null } }) {
  const img = mediaUrl(a.cover)
  return (
    <Link className="acard reveal" href={`/bai-viet/${a.slug}`}>
      <span className="th">{img ? <img src={img} alt="" loading="lazy" /> : <svg className="ph"><use href="#i-gear" /></svg>}</span>
      <span>
        <span className="tt">{a.title}</span>
        <span className="dt" style={{ display: 'block' }}>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
      </span>
    </Link>
  )
}
