import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// 301s from the old evtech.vn URLs so existing Google rankings carry over.
const OLD_URLS: Record<string, string> = {
  'sanpham.html': '/san-pham',
  'lienhe.html': '/lien-he',
  'hoidap.html': '/lien-he',
  'gioi-thieu-bid1.html': '/gioi-thieu',
  'thanh-toan-giao-hang-bid2.html': '/thanh-toan-giao-hang',
  'huong-dan-dat-hang-bid3.html': '/huong-dan-dat-hang',
  'bang-gia-xe-bid4.html': '/lien-he',
  // two old products shared this slug; the second got a "-48" suffix
  'vong-bi-bac-dan-moay-o-banh-truoc-xe-vinfast-id48.html': '/san-pham/vong-bi-bac-dan-moay-o-banh-truoc-xe-vinfast-48',
  'phu-tung-ec-van-d1.html': '/dong-xe/vinfast-ec-van',
  'phu-tung-tuong-thich-limo-green-d2.html': '/dong-xe/vf-limo-green',
  'phu-tung-limo-green-d2.html': '/dong-xe/vf-limo-green',
  'phu-tung-tuong-thich-vf9-d3.html': '/dong-xe/vinfast-vf-9',
  'phu-tung-vf9-d3.html': '/dong-xe/vinfast-vf-9',
  'phu-tung-tuong-thich-vf8-d4.html': '/dong-xe/vinfast-vf-8',
  'phu-tung-vf8-d4.html': '/dong-xe/vinfast-vf-8',
  'phu-tung-tuong-thich-vf7-d5.html': '/dong-xe/vinfast-vf-7',
  'phu-tung-vf7-d5.html': '/dong-xe/vinfast-vf-7',
  'phu-tung-tuong-thich-vf6-d6.html': '/dong-xe/vinfast-vf-6',
  'phu-tung-vf6-d6.html': '/dong-xe/vinfast-vf-6',
  'phu-tung-tuong-thich-vfe34-d7.html': '/dong-xe/vinfast-vf-e34',
  'phu-tung-vfe34-d7.html': '/dong-xe/vinfast-vf-e34',
  'phu-tung-tuong-thich-vf5-d8.html': '/dong-xe/vinfast-vf-5',
  'phu-tung-vf5-d8.html': '/dong-xe/vinfast-vf-5',
  'phu-tung-tuong-thich-vf3-d9.html': '/dong-xe/vinfast-vf-3',
  'phu-tung-vf3-d9.html': '/dong-xe/vinfast-vf-3',
  'combo-phu-tung-hao-mon-tuong-thich-vf5-d10.html': '/dong-xe/vinfast-vf-5',
  'combo-phu-tung-hao-mon-tuong-thich-vfe34-d11.html': '/dong-xe/vinfast-vf-e34',
  'cau-chi-d12.html': '/he-thong/dien-sac',
  'vong-bi-tuong-thich-cac-loai-xe-d13.html': '/he-thong/truyen-dong',
  'motor-quat-dan-nong-tuong-thich-cac-loai-xe-d14.html': '/he-thong/dieu-hoa',
  'ma-phanh-tuong-thich-cac-dong-xe-d15.html': '/he-thong/he-thong-phanh',
  'rotuyn-tuong-thich-cac-loai-d16.html': '/he-thong/gam-lai',
  'bong-den-led-d17.html': '/he-thong/than-vo',
  'day-cap-sac-d18.html': '/he-thong/dien-sac',
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...Object.entries(OLD_URLS).map(([from, to]) => ({ source: `/${from}`, destination: to, permanent: true })),
      // Old product URLs: /<slug>-id123.html -> /san-pham/<slug> (keep the same slug when importing products into the CMS)
      { source: '/:slug([a-z0-9-]+)-id:id(\\d+).html', destination: '/san-pham/:slug', permanent: true },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
