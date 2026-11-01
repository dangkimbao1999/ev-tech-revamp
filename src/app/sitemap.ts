import type { MetadataRoute } from 'next'
import { db } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const p = await db()
  const all = <T extends 'products' | 'vehicles' | 'systems' | 'articles' | 'pages'>(collection: T) =>
    p.find({ collection, limit: 0, pagination: false, depth: 0, select: { slug: true, updatedAt: true }, overrideAccess: false })
  const [products, vehicles, systems, articles, pages] = await Promise.all([all('products'), all('vehicles'), all('systems'), all('articles'), all('pages')])
  const url = (path: string, updatedAt?: string, priority = 0.7) => ({ url: SITE_URL + path, lastModified: updatedAt ? new Date(updatedAt) : undefined, priority })
  return [
    url('/', undefined, 1),
    url('/san-pham', undefined, 0.9),
    url('/gara-dai-ly', undefined, 0.8),
    url('/lien-he', undefined, 0.6),
    url('/bai-viet', undefined, 0.6),
    ...pages.docs.map((d) => url(`/${d.slug}`, d.updatedAt, 0.5)),
    ...vehicles.docs.map((d) => url(`/dong-xe/${d.slug}`, d.updatedAt, 0.9)),
    ...systems.docs.map((d) => url(`/he-thong/${d.slug}`, d.updatedAt, 0.8)),
    ...products.docs.map((d) => url(`/san-pham/${d.slug}`, d.updatedAt, 0.8)),
    ...articles.docs.map((d) => url(`/bai-viet/${d.slug}`, d.updatedAt, 0.6)),
  ]
}
