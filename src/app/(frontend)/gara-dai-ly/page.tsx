import Link from 'next/link'
import { GaraForm } from '@/components/forms'
import { Arr, Ck, Crumb, SecHead, Trust } from '@/components/shared'
import { Ic } from '@/components/store'
import { getSettings } from '@/lib/data'
import { seo } from '@/lib/seo'

export const metadata = seo('/gara-dai-ly', 'Dành cho Gara & Đại lý', 'Chính sách giá sỉ, chiết khấu và hỗ trợ kỹ thuật cho gara, đại lý phụ tùng xe điện. Đăng ký trở thành đối tác EVTECH.', '/img/hero-gara.jpg')

const VALUES = [['percent', 'Giá cạnh tranh', 'Chính sách linh hoạt theo sản lượng'], ['package', 'Nguồn hàng ổn định', 'Đa dạng chủng loại, cập nhật liên tục'], ['wrench', 'Hỗ trợ kỹ thuật', 'Tư vấn lắp đặt, xử lý sự cố'], ['handshake', 'Đồng hành lâu dài', 'Chương trình ưu đãi, phát triển thị trường']]
const BENEFITS = [['percent', 'Chiết khấu hấp dẫn', 'Theo sản lượng và cấp đại lý'], ['wrench', 'Hỗ trợ kỹ thuật', 'Tư vấn, hướng dẫn lắp đặt, xử lý sự cố'], ['grad', 'Đào tạo sản phẩm', 'Cập nhật sản phẩm mới, kiến thức kỹ thuật'], ['mega', 'Hỗ trợ marketing', 'Cung cấp hình ảnh, tài liệu, nội dung'], ['package', 'Ưu tiên nguồn hàng', 'Cam kết ổn định, giao hàng nhanh']]
const PARTNERS: [string, string, string[], string][] = [
  ['Gara sửa chữa ô tô điện', 'partner-gara', ['Cung cấp phụ tùng chất lượng', 'Hỗ trợ kỹ thuật lắp đặt', 'Báo giá nhanh, giao hàng toàn quốc'], 'Gara sửa chữa'],
  ['Đại lý phân phối', 'partner-dai-ly', ['Chính sách chiết khấu hấp dẫn', 'Hỗ trợ truyền thông, hình ảnh', 'Đồng hành phát triển thị trường'], 'Đại lý phân phối'],
  ['Doanh nghiệp dịch vụ vận tải', 'partner-van-tai', ['Giải pháp phụ tùng theo đội xe', 'Hợp đồng dài hạn, giá ưu đãi', 'Hỗ trợ kỹ thuật và bảo hành'], 'Doanh nghiệp khác'],
]

const VCard = ({ v: [i, t, d] }: { v: string[] }) => (
  <div className="vcard2 reveal"><span className="vi"><Ic id={i} /></span><div className="vt">{t}</div><div className="vd">{d}</div></div>
)

export default async function Gara({ searchParams }: { searchParams: Promise<{ loai?: string }> }) {
  const [{ loai = '' }, s] = await Promise.all([searchParams, getSettings()])
  return (
    <div className="view">
      <div className="wrap" style={{ paddingBlock: 16 }}><Crumb items={[['Dành cho Gara & Đại lý']]} /></div>
      <section className="ghero" aria-label="Dành cho Gara & Đại lý">
        <div className="wrap">
          <div className="gh-c">
            <h1>Dành cho Gara & Đại lý</h1>
            <p className="gh-sub">Hợp tác cùng EVTECH – Phát triển bền vững</p>
            <p className="gh-d">Chúng tôi cung cấp giải pháp phụ tùng thay thế cho xe điện với nguồn hàng ổn định, chất lượng đảm bảo, chính sách giá tốt và hỗ trợ kỹ thuật chuyên sâu, đồng hành cùng gara và đại lý trên toàn quốc.</p>
            <div className="actions">
              <a className="btn green lg" href="#register">Đăng ký hợp tác<Arr /></a>
              <a className="btn white lg" href="#consult">Liên hệ tư vấn</a>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap"><div className="gvalues">{VALUES.map((v) => <VCard key={v[1]} v={v} />)}</div></div>

      <section className="sec2">
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <SecHead ov="Đối tượng hợp tác" t="Chúng tôi đồng hành cùng" h="gara & doanh nghiệp" desc="Giải pháp phụ tùng phù hợp với từng mô hình kinh doanh." />
          <div className="ptgrid">
            {PARTNERS.map(([t, im, bul, type]) => (
              <article key={t} className="ptcard reveal">
                <div className="pti"><img src={`/img/${im}.jpg`} alt={t} loading="lazy" /></div>
                <div className="ptb">
                  <h3 className="h6 navy" style={{ margin: 0 }}>{t}</h3>
                  <Ck sm items={bul} />
                  <Link className="link-arrow" href={`/gara-dai-ly?loai=${encodeURIComponent(type)}#register`}><span>Đăng ký với vai trò này</span><Ic id="arrow" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec2" style={{ background: 'var(--sky)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <SecHead ov="Quyền lợi đối tác" t="Quyền lợi khi trở thành" h="đối tác EVTECH" center />
          <div className="gbenefits">{BENEFITS.map((v) => <VCard key={v[1]} v={v} />)}</div>
        </div>
      </section>

      <section id="register" className="sec2" style={{ paddingBottom: 96 }}>
        <div className="wrap g-layout">
          <GaraForm
            key={loai}
            initialType={loai}
            head={<SecHead ov="Đăng ký hợp tác" t="Trở thành" h="đối tác EVTECH" desc="Vui lòng điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất." />}
          />
          <aside className="infocol">
            <div className="infocard" id="consult">
              <div className="h5 navy">Cần tư vấn nhanh?</div>
              <Trust ic="phone" t="Hotline" d={[s.hotline, s.hotline2].filter(Boolean).join(' – ')} copy={s.hotline!} />
              <Trust ic="headset" t="Zalo" d={s.hotline!} copy={s.hotline!} />
              <Trust ic="mail" t="Email" d={s.email!} copy={s.email!} />
              <Trust ic="clock" t="Thời gian làm việc" d={s.hours!} />
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
