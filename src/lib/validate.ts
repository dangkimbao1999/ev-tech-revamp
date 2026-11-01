// Shared by the forms (inline UX) and the server action (trust boundary).
type Rule = (v: string) => true | string

const phone: Rule = (v) => /^(0|\+84)[\s.]?\d([\s.]?\d){8,9}$/.test(v.trim()) || 'Số điện thoại chưa đúng. Ví dụ: 0942 922 000.'
const email: Rule = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Email chưa đúng định dạng, ví dụ: ten@gmail.com.'
const min = (n: number, msg: string): Rule => (v) => v.trim().length >= n || msg
const max = (n: number, r: Rule): Rule => (v) => (v.length > n ? `Tối đa ${n} ký tự.` : r(v))
const optional = (r: Rule): Rule => (v) => !v.trim() || r(v)
const any: Rule = () => true

export const CONTACT_RULES: Record<string, Rule> = {
  name: max(120, min(2, 'Vui lòng nhập họ tên (ít nhất 2 ký tự).')),
  org: max(160, any),
  phone,
  email,
  address: max(255, any),
  message: max(500, min(10, 'Hãy mô tả phụ tùng bạn cần (ít nhất 10 ký tự).')),
}

export const PARTNER_TYPES = ['Gara sửa chữa', 'Đại lý phân phối', 'Doanh nghiệp khác']
export const AREAS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế', 'Quảng Ninh', 'Bắc Ninh', 'Nghệ An', 'Khánh Hòa', 'Lâm Đồng', 'Đồng Nai', 'Tỉnh/thành khác']

export const PARTNER_RULES: Record<string, Rule> = {
  partnerType: (v) => PARTNER_TYPES.includes(v) || 'Vui lòng chọn loại hình đối tác.',
  name: max(160, min(2, 'Vui lòng nhập tên đơn vị hoặc họ tên.')),
  contactPerson: max(120, min(2, 'Vui lòng nhập tên người liên hệ.')),
  phone,
  email: optional(email),
  address: max(255, min(5, 'Vui lòng nhập địa chỉ.')),
  area: (v) => AREAS.includes(v) || 'Vui lòng chọn khu vực.',
  message: max(600, min(10, 'Hãy chia sẻ nhu cầu (ít nhất 10 ký tự).')),
}

export function validate(rules: Record<string, Rule>, data: Record<string, string>) {
  const errors: Record<string, string> = {}
  for (const k in rules) {
    const r = rules[k](data[k] ?? '')
    if (r !== true) errors[k] = r
  }
  return errors
}
