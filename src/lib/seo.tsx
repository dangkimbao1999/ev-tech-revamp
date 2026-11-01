import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://evtech.vn').replace(/\/$/, '')
export const DEFAULT_DESC =
  'EVTECH phân phối bán buôn, bán lẻ phụ tùng thay thế tương thích xe ô tô điện VinFast (VF e34, VF 3, VF 5, VF 6, VF 7, VF 8, VF 9, Limo Green, EC Van) và xe Hybrid. Hàng sẵn kho, giá tốt, giao hàng toàn quốc.'

/** Per-page metadata: title, description, canonical, Open Graph. */
export function seo(path: string, title: string, description = DEFAULT_DESC, image?: string | null): Metadata {
  const desc = description.length > 160 ? description.slice(0, 157).trimEnd() + '…' : description
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, ...(image ? { images: [image] } : {}) },
  }
}

export const JsonLd = ({ data }: { data: object }) => (
  // Escape "<" so CMS text can't close the script tag.
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
)
