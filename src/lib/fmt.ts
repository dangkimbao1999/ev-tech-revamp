export const fmt = (n?: number | null) => (n ? n.toLocaleString('vi-VN').replace(/,/g, '.') + '₫' : 'Liên hệ báo giá')
