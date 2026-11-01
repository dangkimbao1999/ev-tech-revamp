import { ContactForm } from '@/components/forms'
import { Crumb, SecHead, Services, Trust } from '@/components/shared'
import { CopyBtn, Ic } from '@/components/store'
import { getSettings } from '@/lib/data'
import { seo } from '@/lib/seo'

export const metadata = seo('/lien-he', 'Liên hệ', 'Liên hệ EVTECH để được tư vấn và báo giá phụ tùng xe ô tô điện VinFast. Hotline/Zalo 0942.922.000 – 0945.544.000. Trụ sở: Xuân Phương, Hà Nội.')

const MSGS: Record<string, string> = {
  dealer: 'Tôi muốn đăng ký trở thành đại lý của EVTECH. Vui lòng gửi thông tin chính sách hợp tác.',
  price: 'Tôi muốn nhận chính sách giá sỉ phụ tùng của EVTECH.',
  hybrid: 'Tôi cần tư vấn phụ tùng cho xe Hybrid.',
  find: 'Tôi cần tìm phụ tùng: (tên phụ tùng, dòng xe, năm sản xuất…)',
}

export default async function Contact({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const [{ msg = '' }, s] = await Promise.all([searchParams, getSettings()])
  return (
    <div className="view">
      <section className="page-hero">
        <div className="wrap">
          <Crumb items={[['Liên hệ']]} />
          <div style={{ marginTop: 24 }}>
            <SecHead h1 ov="Liên hệ" t="Kết nối với" h="EVTECH" desc="Để lại thông tin, đội ngũ EVTECH sẽ liên hệ lại để tư vấn phụ tùng và báo giá cho bạn." />
          </div>
        </div>
      </section>
      <div className="wrap c-layout">
        <ContactForm key={msg} initialMsg={(MSGS[msg] ?? msg).slice(0, 500)} />
        <div className="infocol">
          <div className="infocard">
            <span className="overline">Thông tin liên hệ</span>
            <div className="h6 navy">{s.company}</div>
            <Trust ic="phone" t="Hotline / Zalo" d={[s.hotline, s.hotline2].filter(Boolean).join(' – ')} copy={s.hotline!} />
            <Trust ic="mail" t="Email" d={s.email!} copy={s.email!} />
            <Trust ic="pin" t="Trụ sở" d={s.address!} copy={s.address!} />
            <Trust ic="globe" t="Website" d={s.website!} copy={s.website!} />
            <CopyBtn text={s.hotline!} className="btn green lg block">Chat Zalo ngay<Ic id="arrow" cls="arr" /></CopyBtn>
          </div>
          <Services />
        </div>
      </div>
    </div>
  )
}
