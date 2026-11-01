'use client'
import Link from 'next/link'
import { useState } from 'react'
import { submitLead } from '@/app/(frontend)/actions'
import { AREAS, CONTACT_RULES, PARTNER_RULES, PARTNER_TYPES, validate } from '@/lib/validate'
import { Ic, useStore } from './store'
import { QSel } from './widgets'

type Rules = Record<string, (v: string) => true | string>

function useFields(rules: Rules, init: Record<string, string>) {
  const [v, setV] = useState<Record<string, string>>(init)
  const [err, setErr] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const check = (k: string, val = v[k] ?? '') => {
    const r = rules[k] ? rules[k](val) : true
    setErr((e) => ({ ...e, [k]: r === true ? '' : r }))
    setTouched((t) => ({ ...t, [k]: true }))
  }
  const set = (k: string, val: string) => {
    setV((s) => ({ ...s, [k]: val }))
    if (touched[k]) check(k, val)
  }
  const field = (k: string, label: string, ph: string, o: { req?: boolean; type?: string; area?: number } = {}) => {
    const state = err[k] ? 'invalid' : touched[k] && v[k]?.trim() ? 'valid' : ''
    const props = {
      id: k,
      placeholder: ph,
      value: v[k] ?? '',
      'aria-invalid': !!err[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
      onBlur: () => (v[k]?.trim() || err[k]) && check(k),
    }
    return (
      <div className={`field gf ${state}`} data-k={k}>
        <label htmlFor={k}>{label}{o.req && <i>*</i>}</label>
        <div className="ctrl">
          {o.area ? <textarea {...props} maxLength={o.area} /> : <input {...props} type={o.type || 'text'} />}
          <span className="ok"><Ic id="check" /></span>
        </div>
        <span className="err">{err[k]}</span>
        {o.area && <span className="counter">{(v[k] ?? '').length}/{o.area}</span>}
      </div>
    )
  }
  /** Validate all; on failure shake + focus the first bad field. */
  const validAll = (form: HTMLFormElement, errs = validate(rules, v)) => {
    setErr(errs)
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])))
    const bad = Object.keys(errs).map((k) => form.querySelector<HTMLElement>(`[data-k="${k}"]`)).filter(Boolean) as HTMLElement[]
    bad.forEach((f) => {
      f.classList.remove('shake')
      void f.offsetWidth
      f.classList.add('shake')
    })
    bad[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    bad[0]?.querySelector<HTMLElement>('input,textarea,button')?.focus({ preventScroll: true })
    return !bad.length
  }
  return { v, err, set, field, validAll, reset: () => (setV({}), setErr({}), setTouched({})) }
}

const Success = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="success">
    <svg className="check" viewBox="0 0 88 88"><circle className="ring" cx="44" cy="44" r="40" /><path className="tick" d="M27 45l12 12 23-25" /></svg>
    <h2 className="h4 navy" style={{ margin: 0 }}>{title}</h2>
    <p className="b-lg t2" style={{ margin: 0, maxWidth: 460 }}>{children}</p>
    <Link className="btn outline lg" href="/">Về trang chủ</Link>
  </div>
)

function useSubmit(kind: 'contact' | 'partner', f: ReturnType<typeof useFields>) {
  const { toast } = useStore()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!f.validAll(form)) return
    setBusy(true)
    try {
      const r = await submitLead(kind, f.v)
      if (r.ok) setDone(true)
      else f.validAll(form, r.errors)
    } catch {
      toast('Gửi không thành công, vui lòng thử lại hoặc gọi hotline.')
    }
    setBusy(false)
  }
  return { busy, done, onSubmit }
}

export function ContactForm({ initialMsg }: { initialMsg: string }) {
  const f = useFields(CONTACT_RULES, { message: initialMsg })
  const { toast } = useStore()
  const { busy, done, onSubmit } = useSubmit('contact', f)
  return (
    <form className="formcard" noValidate onSubmit={onSubmit}>
      {done ? (
        <Success title={`Cảm ơn ${f.v.name}!`}>EVTECH đã nhận lời nhắn và sẽ liên hệ lại qua số điện thoại bạn để lại.</Success>
      ) : (
        <>
          <div>
            <h2 className="h4 navy" style={{ margin: 0 }}>Gửi lời nhắn cho chúng tôi</h2>
            <p className="b-md t2" style={{ margin: '6px 0 0' }}>Các trường có dấu * là bắt buộc.</p>
          </div>
          <div className="frow">{f.field('name', 'Họ tên', 'Nhập họ và tên', { req: true })}{f.field('org', 'Đơn vị', 'Tên công ty / gara (nếu có)')}</div>
          <div className="frow">{f.field('phone', 'Điện thoại', 'Ví dụ: 0942 922 000', { req: true, type: 'tel' })}{f.field('email', 'Email', 'email@domain.com', { req: true, type: 'email' })}</div>
          <div className="frow one">{f.field('address', 'Địa chỉ', 'Số nhà, đường, phường/xã, tỉnh/thành')}</div>
          <div className="frow one">{f.field('message', 'Lời nhắn', 'Mô tả phụ tùng bạn cần: dòng xe, năm sản xuất, số khung (nếu có)…', { req: true, area: 500 })}</div>
          <div className="actions">
            <button className="btn primary lg" type="submit" disabled={busy}>
              {busy ? <><span className="spin" />Đang gửi…</> : <>Gửi liên hệ<Ic id="arrow" cls="arr" /></>}
            </button>
            <button className="btn outline lg" type="button" onClick={() => (f.reset(), toast('Đã xoá nội dung form'))}>Soạn lại</button>
          </div>
        </>
      )}
    </form>
  )
}

export function GaraForm({ initialType, head }: { initialType: string; head: React.ReactNode }) {
  const f = useFields(PARTNER_RULES, { partnerType: PARTNER_TYPES.includes(initialType) ? initialType : PARTNER_TYPES[0] })
  const { busy, done, onSubmit } = useSubmit('partner', f)
  return (
    <form className="formcard" id="gform" noValidate onSubmit={onSubmit}>
      {done ? (
        <Success title={`Đã nhận đăng ký của ${f.v.name}`}>
          Loại hình: <b>{f.v.partnerType}</b>. EVTECH sẽ liên hệ lại trong thời gian sớm nhất.
        </Success>
      ) : (
        <>
          {head}
          <div className="field">
            <label id="gt-l">Loại hình đối tác<i>*</i></label>
            <div className="radios" role="radiogroup" aria-labelledby="gt-l">
              {PARTNER_TYPES.map((t) => (
                <button key={t} type="button" className={`radio ${f.v.partnerType === t ? 'on' : ''}`} role="radio" aria-checked={f.v.partnerType === t} onClick={() => f.set('partnerType', t)}>
                  <span className="rc" />{t}
                </button>
              ))}
            </div>
          </div>
          <div className="frow">{f.field('name', 'Tên đơn vị / Họ tên', 'Nhập tên gara / công ty / họ tên', { req: true })}{f.field('contactPerson', 'Người liên hệ', 'Nhập họ tên người liên hệ', { req: true })}</div>
          <div className="frow">{f.field('phone', 'Số điện thoại', 'Ví dụ: 0942 922 000', { req: true, type: 'tel' })}{f.field('email', 'Email', 'email@domain.com', { type: 'email' })}</div>
          <div className="frow">
            {f.field('address', 'Địa chỉ', 'Nhập địa chỉ gara / công ty', { req: true })}
            <AreaField value={f.v.area ?? ''} error={f.err.area} onChange={(a) => f.set('area', a)} />
          </div>
          <div className="frow one">{f.field('message', 'Nhu cầu hợp tác', 'Vui lòng chia sẻ nhu cầu: dòng xe đang phục vụ, sản phẩm quan tâm, sản lượng dự kiến…', { req: true, area: 600 })}</div>
          <button className="btn green lg block" type="submit" disabled={busy}>
            {busy ? <><span className="spin" />Đang gửi đăng ký…</> : <>Gửi đăng ký<Ic id="send" cls="arr" /></>}
          </button>
        </>
      )}
    </form>
  )
}

function AreaField({ value, error, onChange }: { value: string; error?: string; onChange: (v: string) => void }) {
  const [tried, setTried] = useState(false)
  const bad = (tried || !!error) && !value
  return (
    <div className={`field gf ${bad ? 'invalid' : ''}`} data-k="area" onBlur={() => setTried(true)}>
      <label>Khu vực<i>*</i></label>
      <QSel cls="full" ph="Chọn tỉnh/thành phố" opts={AREAS} value={value} onChange={onChange} />
      <span className="err">{bad ? 'Vui lòng chọn khu vực.' : ''}</span>
    </div>
  )
}
