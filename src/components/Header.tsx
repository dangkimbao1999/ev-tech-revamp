'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { fmt } from '@/lib/fmt'
import { CopyBtn, Ic, quoteMessage, useStore } from './store'

type Item = { name: string; slug: string; img?: string | null }
type Hit = { href: string; name: string; img: string | null; right: string }

const hi = (t: string, s: string) => {
  const i = t.toLowerCase().indexOf(s.toLowerCase())
  return i < 0 ? t : <>{t.slice(0, i)}<mark>{t.slice(i, i + s.length)}</mark>{t.slice(i + s.length)}</>
}

export function Header({ vehicles, systems, hotline, company, tagline, hasArticles }: { vehicles: Item[]; systems: Item[]; hotline: string; company: string; tagline: string; hasArticles: boolean }) {
  const path = usePathname()
  const router = useRouter()
  const { quote, toast } = useStore()
  const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [idx, setIdx] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const count = Object.values(quote).reduce((a, b) => a + b.qty, 0)

  useEffect(() => setDrawer(false), [path])

  useEffect(() => {
    clearTimeout(timer.current)
    const s = q.trim()
    setIdx(-1)
    if (!s) return setHits(null)
    timer.current = setTimeout(async () => {
      const p = new URLSearchParams({ limit: '5', depth: '1', 'where[or][0][name][like]': s, 'where[or][1][sku][like]': s })
      const r = await fetch('/api/products?' + p).then((r) => r.json()).catch(() => ({ docs: [] }))
      const cars = vehicles.filter((v) => v.name.toLowerCase().includes(s.toLowerCase())).slice(0, 2)
      setHits([
        ...cars.map((v) => ({ href: `/dong-xe/${v.slug}`, name: v.name, img: v.img ?? null, right: 'Dòng xe' })),
        ...r.docs.map((p: { slug: string; name: string; price?: number; images?: { url?: string }[] }) => ({
          href: `/san-pham/${p.slug}`,
          name: p.name,
          img: p.images?.[0]?.url ?? null,
          right: fmt(p.price),
        })),
      ])
    }, 200)
  }, [q, vehicles])

  const go = (href: string) => {
    setHits(null)
    router.push(href)
  }
  const active = (p: string) => (path.startsWith(p) ? 'active' : '')
  const nav = [
    { href: '/gioi-thieu', label: 'Giới thiệu', on: active('/gioi-thieu') },
    { href: vehicles[0] ? `/dong-xe/${vehicles[0].slug}` : '/san-pham', label: 'Phụ tùng theo dòng xe', on: active('/dong-xe'), dd: vehicles.map((v) => ({ href: `/dong-xe/${v.slug}`, name: v.name })) },
    { href: systems[0] ? `/he-thong/${systems[0].slug}` : '/san-pham', label: 'Phụ tùng theo hệ thống', on: active('/he-thong'), dd: systems.map((s) => ({ href: `/he-thong/${s.slug}`, name: s.name })) },
    { href: '/lien-he?msg=hybrid', label: 'Hybrid' },
    { href: '/gara-dai-ly', label: 'Dành cho Gara & Đại lý', on: active('/gara-dai-ly') },
    ...(hasArticles ? [{ href: '/bai-viet', label: 'Bài viết', on: active('/bai-viet') }] : []),
    { href: '/lien-he', label: 'Liên hệ', on: active('/lien-he') },
  ]

  return (
    <>
      <header className="site" id="hdr">
        <div className="wrap hdr-top">
          <Link className="logo brand" href="/" aria-label="EVTECH – Trang chủ">
            <img src="/img/logo.png" alt="EVTECH.vn" />
            <span className="brand-t"><b>{company}</b><small>{tagline}</small></span>
          </Link>
          <form
            className="hsearch"
            role="search"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              if (idx >= 0 && hits?.[idx]) return go(hits[idx].href)
              if (q.trim()) go('/san-pham?q=' + encodeURIComponent(q.trim()))
            }}
          >
            <input
              type="search"
              placeholder="Tìm tên phụ tùng, mã hàng, dòng xe..."
              aria-label="Tìm phụ tùng"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => setTimeout(() => setHits(null), 180)}
              onKeyDown={(e) => {
                if (!hits?.length) return
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  setIdx((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length)
                }
                if (e.key === 'Escape') setHits(null)
              }}
            />
            <button className="hs-btn" type="submit" aria-label="Tìm kiếm"><Ic id="search" /></button>
            <div className={`suggest ${hits ? 'show' : ''}`} role="listbox">
              {hits?.length
                ? hits.map((h, i) => (
                    <button type="button" role="option" aria-selected={i === idx} key={h.href} className={i === idx ? 'on' : ''} onClick={() => go(h.href)}>
                      {h.img ? <img src={h.img} alt="" /> : <span className="sg-noimg"><Ic id="gear" /></span>}
                      <span className="nm">{hi(h.name, q.trim())}</span>
                      <span className="pr">{h.right}</span>
                    </button>
                  ))
                : hits && <div className="empty">Không tìm thấy “{q}”. Gửi yêu cầu để EVTECH tìm giúp bạn.</div>}
            </div>
          </form>
          <div className="hdr-right">
            <CopyBtn text={hotline} className="hot">
              <span className="hot-ic"><Ic id="phone" /></span>
              <span className="hot-t"><small>Hotline</small><b>{hotline}</b></span>
            </CopyBtn>
            <CopyBtn text={hotline} className="pill-link">Zalo</CopyBtn>
            <Link className="pill-link" href="/lien-he">Chat</Link>
            <button
              className="cart"
              type="button"
              aria-label="Danh sách báo giá"
              onClick={() =>
                count ? router.push('/lien-he?msg=' + encodeURIComponent(quoteMessage(quote))) : toast('Danh sách báo giá đang trống. Bấm “Liên hệ báo giá” ở sản phẩm để thêm.')
              }
            >
              <Ic id="cart" />
              {count > 0 && <span className="cart-n">{count}</span>}
            </button>
            <button className="burger" aria-label="Mở menu" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}><span /></button>
          </div>
        </div>
        <div className="hdr-nav">
          <div className="wrap">
            <nav className="menu" aria-label="Menu chính">
              {nav.map((n) => (
                <div className="nav-item" key={n.label}>
                  <Link className={`nav-link ${n.on || ''}`} href={n.href} aria-haspopup={n.dd ? 'true' : undefined}>
                    {n.label}
                    {n.dd && <Ic id="down" />}
                  </Link>
                  {n.dd && (
                    <div className="dropdown">
                      {n.dd.map((d) => (
                        <Link key={d.href} href={d.href}>{d.name}<Ic id="arrow" /></Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <div className={`drawer ${drawer ? 'open' : ''}`} aria-hidden={!drawer}>
        <div className="scrim" onClick={() => setDrawer(false)} />
        <div className="panel">
          {nav.map((n) => (
            <Link key={n.label} className={`dl ${n.on || ''}`} href={n.href} onClick={() => setDrawer(false)}>{n.label}</Link>
          ))}
          <CopyBtn text={hotline} className="btn green block">Hotline {hotline}</CopyBtn>
        </div>
      </div>
    </>
  )
}
