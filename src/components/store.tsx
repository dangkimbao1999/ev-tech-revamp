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

type Store = {
  askQuote: (name: string) => void
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

/** Phones/tablets: hotline links dial straight away. Mouse users get a copy instead (no dialer on desktop). */
const TOUCH = '(max-width:760px), (hover:none) and (pointer:coarse)'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [favs, setFavs] = useState<Set<number>>(new Set())
  const [toasts, setToasts] = useState<{ id: number; msg: string; out?: boolean }[]>([])
  const [modal, setModal] = useState<{ c: Card; quote: boolean } | null>(null)
  const ready = useRef(false)

  useEffect(() => {
    setFavs(new Set(load<number[]>('evt-favs', [])))
    ready.current = true
  }, [])
  useEffect(() => {
    if (ready.current) localStorage.setItem('evt-favs', JSON.stringify([...favs]))
  }, [favs])

  const toast = useCallback((msg: string) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x))), 2200)
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500)
  }, [])

  const copy = useCallback(
    async (txt: string) => {
      try {
        await navigator.clipboard.writeText(txt)
        toast('Đã sao chép: ' + txt)
        return true
      } catch {
        toast('Chưa sao chép được, hãy chép tay: ' + txt)
        return false
      }
    },
    [toast],
  )
  const closeModal = useCallback(() => setModal(null), [])

  const store: Store = {
    askQuote: (name) => {
      setModal(null)
      router.push('/lien-he?msg=' + encodeURIComponent(`Tôi cần báo giá: ${name}.`) + '#cform')
      toast('Đã điền sẵn tên phụ tùng vào lời nhắn')
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
    copy,
    quick: (c, q = false) => setModal({ c, quote: q }),
  }

  return (
    <Ctx.Provider value={store}>
      {children}
      <QuickView m={modal} close={closeModal} />
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
  const { askQuote } = useStore()
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!m) return
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
          <div className="actions" style={{ marginTop: 'auto' }}>
            <button className={`btn lg ${m?.quote ? 'green' : 'primary'}`} onClick={() => c && askQuote(c.name)}>
              Liên hệ báo giá
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

/** Hotline link: opens the phone's dialer on mobile; on desktop copies the number. */
export function PhoneBtn({ num, className, label, children }: { num: string; className?: string; label?: string; children?: React.ReactNode }) {
  const { copy } = useStore()
  return (
    <a
      className={className}
      href={`tel:${num.replace(/\D/g, '')}`}
      aria-label={label}
      onClick={(e) => {
        if (matchMedia(TOUCH).matches) return
        e.preventDefault()
        void copy(num)
      }}
    >
      {children ?? num}
    </a>
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
          <button className="btn green sm block" type="button" onClick={() => s.askQuote(c.name)}>Liên hệ báo giá</button>
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
