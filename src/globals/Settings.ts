import type { GlobalConfig } from 'payload'

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
