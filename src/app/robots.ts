import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // NOINDEX=1 on preview/staging (e.g. *.vercel.app) so it doesn't compete with the real domain.
  if (process.env.NOINDEX) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: ['/', '/api/media/file/'], disallow: ['/admin', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
