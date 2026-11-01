'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Card } from '@/lib/data'
import { Ic, ProductCard, Qty, useStore } from './store'

/** Moving underline/pill under the active tab, like the prototype. */
function useIndicator(active: unknown, offset = 0) {
  const wrap = useRef<HTMLDivElement>(null)
  const ind = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const move = () => {
      const on = wrap.current?.querySelector<HTMLElement>('.on')
      if (!on || !ind.current) return
      ind.current.style.width = on.offsetWidth + 'px'
      ind.current.style.transform = `translateX(${on.offsetLeft - offset}px)`
    }
    move()
    addEventListener('resize', move)
    return () => removeEventListener('resize', move)
  }, [active, offset])
  return { wrap, ind }
}

const useOutside = (ref: React.RefObject<HTMLElement | null>, close: () => void) =>
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close()
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [ref, close])

export function QSel({ ph, opts, value, onChange, cls = '' }: { ph: string; opts: string[]; value: string; onChange: (v: string) => void; cls?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  return (
    <div ref={ref} className={`qsel ${cls} ${open ? 'open' : ''} ${value ? 'has' : ''}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="v">{value || ph}</span>
        <Ic id="down" />
      </button>
      <ul role="listbox">
        {opts.map((o) => (
          <li key={o}>
            <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false) }}>{o}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

type Named = { name: string; slug: string }
const SEGS = [['car', 'Theo dòng xe'], ['part', 'Theo phụ tùng'], ['code', 'Theo mã sản phẩm']] as const

export function QuickSearch({ vehicles, systems }: { vehicles: Named[]; systems: Named[] }) {
  const router = useRouter()
  const { toast } = useStore()
  const [mode, setMode] = useState<(typeof SEGS)[number][0]>('car')
  const [car, setCar] = useState('')
  const [sys, setSys] = useState('')
  const [kw, setKw] = useState('')
  const form = useRef<HTMLFormElement>(null)
  const { wrap, ind } = useIndicator(mode, 4)
  const carV = mode === 'car' ? car : ''
  const sysV = mode === 'code' ? '' : sys
  return (
    <form
      className="qsearch"
      ref={form}
      id="quick"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault()
        if (!carV && !sysV && !kw.trim()) {
          const f = form.current!
          f.classList.remove('shake')
          void f.offsetWidth
          f.classList.add('shake')
          return toast('Chọn dòng xe, hệ thống hoặc nhập từ khoá để tra cứu')
        }
        const v = vehicles.find((x) => x.name === carV)
        const s = systems.find((x) => x.name === sysV)
        const p = new URLSearchParams(kw.trim() ? { q: kw.trim() } : {})
        if (v && s) p.set('he-thong', s.slug)
        router.push((v ? `/dong-xe/${v.slug}` : s ? `/he-thong/${s.slug}` : '/san-pham') + '?' + p)
      }}
    >
      <div className="qh">
        <h2 className="h5 navy" style={{ margin: 0 }}>Tra cứu phụ tùng nhanh</h2>
        <div className="seg" role="tablist" ref={wrap}>
          {SEGS.map(([k, l]) => (
            <button key={k} type="button" className={mode === k ? 'on' : ''} role="tab" aria-selected={mode === k} onClick={() => setMode(k)}>{l}</button>
          ))}
          <span className="seg-pill" ref={ind} style={{ left: 4 }} />
        </div>
      </div>
      <div className="qf">
        <QSel cls={mode !== 'car' ? 'qhide' : ''} ph="Chọn dòng xe" opts={vehicles.map((v) => v.name)} value={car} onChange={setCar} />
        <QSel cls={mode === 'code' ? 'qhide' : ''} ph="Chọn hệ thống phụ tùng" opts={systems.map((s) => s.name)} value={sys} onChange={setSys} />
        <label className="qkw">
          <Ic id="search" />
          <input id="qkw" type="text" value={kw} onChange={(e) => setKw(e.target.value)} placeholder={mode === 'code' ? 'Nhập mã sản phẩm, ví dụ: EVT-PP4…' : 'Nhập tên phụ tùng hoặc mã hàng…'} aria-label="Từ khoá" />
        </label>
        <button className="btn green" type="submit">Tìm kiếm</button>
      </div>
    </form>
  )
}

export function FeaturedTabs({ tabs, cards }: { tabs: string[]; cards: Card[] }) {
  const [tab, setTab] = useState('Tất cả')
  const { wrap, ind } = useIndicator(tab)
  const list = (tab === 'Tất cả' ? cards : cards.filter((c) => c.cat === tab)).slice(0, 5)
  return (
    <>
      <div className="tabs" role="tablist" ref={wrap}>
        {['Tất cả', ...tabs].map((t) => (
          <button key={t} className={`tab ${t === tab ? 'on' : ''}`} role="tab" aria-selected={t === tab} onClick={() => setTab(t)}>{t}</button>
        ))}
        <span className="tab-ind" ref={ind} />
      </div>
      <div className="p-grid c5 fade" key={tab}>
        {list.length ? (
          list.map((c) => <ProductCard key={c.id} c={c} quote />)
        ) : (
          <div className="empty-tab">
            <Ic id="gear" />
            <b className="navy">Nhóm “{tab}” đang được cập nhật</b>
            <span>Gửi yêu cầu để EVTECH báo giá phụ tùng bạn cần.</span>
            <Link className="btn green" href="/lien-he?msg=find">Gửi yêu cầu<Ic id="arrow" cls="arr" /></Link>
          </div>
        )}
      </div>
    </>
  )
}

export function SortSelect({ value, options }: { value: string; options: [string, string][] }) {
  const router = useRouter()
  const path = usePathname()
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  return (
    <div ref={ref} className={`select ${open ? 'open' : ''}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="tm">Sắp xếp:</span>
        <span className="val">{options.find((o) => o[0] === value)?.[1]}</span>
        <Ic id="down" />
      </button>
      <ul role="listbox">
        {options.map(([k, l]) => (
          <li key={k}>
            <button
              type="button"
              role="option"
              aria-selected={k === value}
              onClick={() => {
                const p = new URLSearchParams(sp)
                p.set('sort', k)
                p.delete('page')
                setOpen(false)
                router.push(`${path}?${p}`, { scroll: false })
              }}
            >
              {l}
              {k === value && <Ic id="check" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Gallery({ imgs, name }: { imgs: string[]; name: string }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState<string | null>(null)
  if (!imgs.length)
    return (
      <div className="pd-main">
        <div className="noimg" role="img" aria-label="Ảnh sản phẩm đang cập nhật"><Ic id="gear" /><span>Ảnh đang cập nhật</span></div>
      </div>
    )
  return (
    <>
      <div
        className={`pd-main ${zoom ? 'zoom' : ''}`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
        }}
        onPointerLeave={() => setZoom(null)}
      >
        <img key={i} className="swap" src={imgs[i]} alt={name} style={{ transformOrigin: zoom ?? undefined }} />
        <span className="pd-hint"><Ic id="search" />Rê chuột để phóng to</span>
      </div>
      {imgs.length > 1 && (
        <div className="pd-thumbs" role="tablist" aria-label="Ảnh sản phẩm">
          {imgs.map((src, k) => (
            <button key={src + k} className={`pd-th ${k === i ? 'on' : ''}`} role="tab" aria-selected={k === i} aria-label={`Ảnh ${k + 1}`} onClick={() => setI(k)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export function ProductTabs({ labels, panels }: { labels: string[]; panels: React.ReactNode[] }) {
  const [i, setI] = useState(0)
  const { wrap, ind } = useIndicator(i)
  return (
    <div className="pd-tabs">
      <div className="tabs" role="tablist" ref={wrap}>
        {labels.map((t, k) => (
          <button key={t} className={`tab ${k === i ? 'on' : ''}`} role="tab" aria-selected={k === i} onClick={() => setI(k)}>{t}</button>
        ))}
        <span className="tab-ind" ref={ind} />
      </div>
      <div className="pd-panel fade" key={i} role="tabpanel">{panels[i]}</div>
    </div>
  )
}

export function BuyBox({ c, hotline }: { c: Pick<Card, 'id' | 'name'>; hotline: string }) {
  const { quote, addQuote, copy } = useStore()
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const added = !!quote[c.id]
  return (
    <>
      <div className="pd-buy">
        <Qty v={qty} set={setQty} />
        <button className={`btn green lg quote ${added ? 'added' : ''}`} type="button" style={{ flex: 1 }} onClick={() => addQuote(c, qty)}>
          {added ? <><Ic id="check" />Đã thêm báo giá</> : 'Liên hệ báo giá'}
        </button>
      </div>
      <div className="pd-sec">
        <button className="btn outline" type="button" onClick={() => copy(hotline)}>Zalo tư vấn</button>
        <button className="btn outline" type="button" onClick={() => router.push('/lien-he?msg=' + encodeURIComponent(`Tôi cần báo giá: ${c.name} × ${qty}.`))}>Gửi yêu cầu báo giá</button>
      </div>
    </>
  )
}
