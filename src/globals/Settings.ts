import type { GlobalConfig, UploadFieldSingleValidation } from 'payload'

/** Home banner size. Fixed so an upload can't skew the hero (the default /img/hero-home.jpg is this size). */
export const HERO = { w: 1920, h: 815, mime: ['image/jpeg', 'image/png', 'image/webp'] }

export const validateHero: UploadFieldSingleValidation = async (value, { req }) => {
  if (!value) return true // empty → site falls back to the default banner
  const id = typeof value === 'object' ? (value as { id: number | string }).id : (value as number | string)
  const m = await req.payload.findByID({ collection: 'media', id, depth: 0, req }).catch(() => null)
  if (!m) return 'Không tìm thấy ảnh đã chọn.'
  if (!m.mimeType || !HERO.mime.includes(m.mimeType)) return 'Ảnh banner phải là JPG, PNG hoặc WebP.'
  if (m.width !== HERO.w || m.height !== HERO.h)
    return `Ảnh banner phải đúng ${HERO.w}×${HERO.h} px (ảnh đã chọn: ${m.width ?? '?'}×${m.height ?? '?'} px).`
  return true
}

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Thông tin công ty',
  access: { read: () => true },
  fields: [
    { name: 'company', label: 'Tên công ty', type: 'text', defaultValue: 'Công ty Cổ phần EVTECH Group' },
    { name: 'tagline', label: 'Slogan', type: 'text', defaultValue: 'Giải pháp phụ tùng thay thế cho xe điện' },
    { name: 'intro', label: 'Giới thiệu ngắn (footer)', type: 'textarea', defaultValue: 'Công ty Cổ phần EVTECH Group – nhà phân phối phụ tùng chính hãng cho xe điện và xe Hybrid.' },
    { name: 'hotline', label: 'Hotline chính / Zalo', type: 'text', defaultValue: '0942.922.000' },
    { name: 'hotline2', label: 'Hotline phụ', type: 'text', defaultValue: '0945.544.000' },
    { name: 'email', type: 'text', defaultValue: 'Evtech.phutung@gmail.com' },
    { name: 'website', type: 'text', defaultValue: 'evtech.vn' },
    { name: 'address', label: 'Trụ sở', type: 'text', defaultValue: 'Tầng 2, Toà CT1, Khu đô thị Dream Town, đường Tây Mỗ, Xuân Phương, Hà Nội' },
    { name: 'hours', label: 'Giờ làm việc', type: 'text', defaultValue: 'Thứ 2 – Thứ 7: 8h00 – 17h30' },
    {
      name: 'heroImage',
      label: 'Ảnh banner trang chủ',
      type: 'upload',
      relationTo: 'media',
      validate: validateHero,
      admin: {
        description: `Bắt buộc đúng ${HERO.w}×${HERO.h} px, JPG/PNG/WebP. Nội dung chính nên nằm ở nửa bên phải (bên trái bị che bởi chữ). Để trống để dùng ảnh banner mặc định.`,
      },
    },
    {
      name: 'socials',
      label: 'Mạng xã hội',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
