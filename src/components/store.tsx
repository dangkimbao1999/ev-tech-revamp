'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Card } from '@/lib/data'
import { fmt } from '@/lib/fmt'

export const Ic = ({ id, cls = '' }: { id: string; cls?: string }) => (
  <svg className={cls}>
    <use href={`#i-${id}`} />
  </svg>
)
const Arr = () => <Ic id="arrow" cls="arr" />

export const Pimg = ({ c, cls = '' }: { c: { img: string | null; name: string }; cls?: string }) =>
  c.img ? (
    <img className={`ph-img ${cls}`} src={c.img} alt={c.name} loading="lazy" />
  ) : (
    <div className="noimg" role="img" aria-label="Ảnh sản phẩm đang cập nhật">
      <Ic id="gear" />
      <span>Ảnh đang cập nhật</span>
    </div>
  )

type Quote = Record<number, { name: string; qty: number }>
type Store = {
  quote: Quote
  addQuote: (c: Pick<Card, 'id' | 'name'>, qty?: number) => void
  favs: Set<number>
  toggleFav: (id: number) => void
  toast: (msg: string) => void
  copy: (txt: string) => Promise<boolean>
  quick: (c: Card, quoteMode?: boolean) => void
}
const Ctx = createContext<Store>(null as never)
export const useStore = () => useContext(Ctx)

const load = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) || '') as T
  } catch {
    return d
  }
}

export const quoteMessage = (q: Quote) =>
  'Tôi cần báo giá các phụ tùng sau:\n' + Object.values(q).map((x) => `- ${x.name} × ${x.qty}`).join('\n')

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [quote, setQuote] = useState<Quote>({})
  const [favs, setFavs] = useState<Set<number>>(new Set())
  const [toasts, setToasts] = useState<{ id: number; msg: string; out?: boolean }[]>([])
  const [modal, setModal] = useState<{ c: Card; quote: boolean } | null>(null)
  const ready = useRef(false)

  useEffect(() => {
    setQuote(load('evt-quote', {}))
    setFavs(new Set(load<number[]>('evt-favs', [])))
    ready.current = true
  }, [])
  useEffect(() => {
    if (ready.current) localStorage.setItem('evt-quote', JSON.stringify(quote))
  }, [quote])
  useEffect(() => {
    if (ready.current) localStorage.setItem('evt-favs', JSON.stringify([...favs]))
  }, [favs])

  const toast = useCallback((msg: string) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x))), 2200)
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
  }, [])

  const store: Store = {
    quote,
    addQuote: (c, qty = 1) => {
      setQuote((q) => ({ ...q, [c.id]: { name: c.name, qty: (q[c.id]?.qty || 0) + qty } }))
      toast('Đã thêm vào danh sách báo giá: ' + c.name)
    },
    favs,
    toggleFav: (id) => {
      const on = !favs.has(id)
      setFavs((f) => {
        const n = new Set(f)
        if (on) n.add(id)
        else n.delete(id)
        return n
      })
      toast(on ? 'Đã thêm vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích')
    },
    toast,
    copy: async (txt) => {
      try {
        await navigator.clipboard.writeText(txt)
        toast('Đã sao chép: ' + txt)
        return true
      } catch {
        toast(txt)
        return false
      }
    },
    quick: (c, q = false) => setModal({ c, quote: q }),
  }

  return (
    <Ctx.Provider value={store}>
      {children}
      <QuickView m={modal} close={() => setModal(null)} />
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.out ? 'out' : ''}`}>
            <Ic id="check" />
            {t.msg}
          </div>
        ))}
      </div>
      <ToTop />
    </Ctx.Provider>
  )
}

function QuickView({ m, close }: { m: { c: Card; quote: boolean } | null; close: () => void }) {
  const { addQuote } = useStore()
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!m) return
    setQty(1)
    document.body.style.overflow = 'hidden'
    setTimeout(() => closeBtn.current?.focus(), 50)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', esc)
    }
  }, [m, close])
  const c = m?.c
  const order = () => {
    if (!c) return
    if (m.quote) addQuote(c, qty)
    else router.push('/lien-he?msg=' + encodeURIComponent(`Tôi muốn đặt ${qty} × ${c.name}${c.price ? ` (giá tham khảo ${fmt(c.price)})` : ''}.`))
    close()
  }
  return (
    <div className={`modal ${m ? 'open' : ''}`} aria-hidden={!m}>
      <div className="scrim" onClick={close} />
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="m-title">
        <button className="close" onClick={close} aria-label="Đóng" ref={closeBtn}>
          <Ic id="x" />
        </button>
        <div className="mimg">{c && <Pimg c={c} cls="big" />}</div>
        <div className="mbody">
          <span className="overline">{c?.cat}</span>
          <h3 className="h4 navy" id="m-title" style={{ margin: 0 }}>
            {c?.name}
          </h3>
          <div className="price">
            {!m?.quote && c?.price ? <small>Giá chỉ từ</small> : null}
            <b>{m?.quote ? 'Liên hệ báo giá' : fmt(c?.price ?? null)}</b>
          </div>
          <div className="chips">
            <span className="chip"><Ic id="shield" />Hàng chuẩn</span>
            <span className="chip"><Ic id="truck" />Giao nhanh toàn quốc</span>
            <span className="chip"><Ic id="headset" />Tư vấn kỹ thuật</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="b-md t2">Số lượng</span>
            <Qty v={qty} set={setQty} />
          </div>
          <div className="actions" style={{ marginTop: 'auto' }}>
            <button className={`btn lg ${m?.quote ? 'green' : 'primary'}`} onClick={order}>
              {m?.quote ? 'Thêm vào danh sách báo giá' : 'Liên hệ đặt hàng'}
              <Arr />
            </button>
            {c && (
              <Link className="btn outline lg" href={`/san-pham/${c.slug}`} onClick={close}>
                Xem trang chi tiết
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Qty({ v, set }: { v: number; set: (n: number) => void }) {
  const b = (d: number) => set(Math.max(1, Math.min(99, v + d)))
  return (
    <div className="qty">
      <button type="button" onClick={() => b(-1)} aria-label="Giảm">−</button>
      <output>{v}</output>
      <button type="button" onClick={() => b(1)} aria-label="Tăng">+</button>
    </div>
  )
}

function ToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      setShow(scrollY > 700)
      document.getElementById('hdr')?.classList.toggle('scrolled', scrollY > 40)
    }
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <button className={`totop ${show ? 'show' : ''}`} aria-label="Lên đầu trang" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>
      <Ic id="arrow" />
    </button>
  )
}

export function CopyBtn({ text, className = 'copy', children }: { text: string; className?: string; children?: React.ReactNode }) {
  const { copy } = useStore()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={`${className} ${done ? 'done' : ''}`}
      onClick={async () => {
        if ((await copy(text)) && !children) {
          setDone(true)
          setTimeout(() => setDone(false), 1600)
        }
      }}
    >
      {children ?? (done ? 'Đã chép' : 'Sao chép')}
    </button>
  )
}

export function ProductCard({ c, quote = false }: { c: Card; quote?: boolean }) {
  const s = useStore()
  const on = s.favs.has(c.id)
  const href = `/san-pham/${c.slug}`
  const added = !!s.quote[c.id]
  return (
    <article className="pcard">
      <div className="img">
        <Link className="img-link" href={href} aria-label={`Xem chi tiết ${c.name}`} />
        <Pimg c={c} />
        <button className={`fav ${on ? 'on' : ''}`} aria-pressed={on} aria-label="Yêu thích" onClick={() => s.toggleFav(c.id)}>
          <Ic id="heart" />
        </button>
        <div className="quick">
          <button className="btn white sm" onClick={() => s.quick(c, quote)}>
            <Ic id="eye" />
            Xem nhanh
          </button>
        </div>
      </div>
      <div className="body">
        <h3 className="nm" style={{ margin: 0 }}>
          <Link href={href}>{c.name}</Link>
        </h3>
        {quote ? (
          <button className={`btn green sm block quote ${added ? 'added' : ''}`} onClick={() => s.addQuote(c)}>
            {added ? <><Ic id="check" />Đã thêm báo giá</> : 'Liên hệ báo giá'}
          </button>
        ) : (
          <>
            <div className="price">
              {c.price ? <small>Giá chỉ từ</small> : null}
              <b>{fmt(c.price)}</b>
            </div>
            <Link className="btn outline sm block" href={href}>
              Xem chi tiết
              <Arr />
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
