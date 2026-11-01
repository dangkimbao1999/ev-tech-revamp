import { Be_Vietnam_Pro } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/shared'
import { SPRITE } from '@/components/sprite'
import { StoreProvider } from '@/components/store'
import type { Metadata } from 'next'
import { countArticles, getNav, getSettings, mediaUrl } from '@/lib/data'
import { DEFAULT_DESC, JsonLd, SITE_URL } from '@/lib/seo'
import './globals.css'

// ponytail: always render fresh from the CMS; add revalidatePath hooks if traffic needs caching.
export const dynamic = 'force-dynamic'

const font = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-bvp' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Nhà phân phối phụ tùng thay thế xe ô tô điện VinFast | EVTECH', template: '%s | EVTECH' },
  description: DEFAULT_DESC,
  keywords: ['phụ tùng vinfast', 'phụ tùng xe điện', 'phụ tùng VF e34', 'phụ tùng VF 5', 'má phanh vinfast', 'phụ tùng hybrid'],
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'EVTECH', images: ['/img/hero-home.jpg'] },
  // Search Console ownership tokens copied from the current evtech.vn
  ...(process.env.NOINDEX ? { robots: { index: false, follow: false } } : {}),
  verification: { google: ['TX3J5H5sJ1C9VIy1Nsov8XMavC6bXApYhtbA94Amr6Q', 'YkbzcpOM3PHj8EM4r6fWuCAAc4J5-C4JaN_mVk93-n4'] },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, { vehicles, systems }, articleCount] = await Promise.all([getSettings(), getNav(), countArticles()])
  return (
    <html lang="vi" className={font.variable}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "AutoPartsStore",
            name: s.company,
            url: SITE_URL,
            logo: SITE_URL + "/img/logo.png",
            image: SITE_URL + "/img/hero-home.jpg",
            telephone: s.hotline,
            email: s.email,
            address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: "Hà Nội", addressCountry: "VN" },
            sameAs: s.socials?.map((x) => x.url).filter((u) => u.startsWith("http")),
          }}
        />
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs dangerouslySetInnerHTML={{ __html: SPRITE }} />
        </svg>
        <StoreProvider>
          <Header
            vehicles={vehicles.map((v) => ({ name: v.name, slug: v.slug!, img: mediaUrl(v.image) }))}
            systems={systems.map((x) => ({ name: x.name, slug: x.slug! }))}
            hotline={s.hotline!}
            company={s.company!}
            tagline={s.tagline!}
            hasArticles={articleCount > 0}
          />
          <main id="app">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  )
}
