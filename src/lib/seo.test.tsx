import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { DEFAULT_DESC, JsonLd, SITE_URL, seo } from './seo'

test('seo() sets title, canonical and Open Graph', () => {
  const m = seo('/lien-he', 'Liên hệ', 'Mô tả ngắn', '/img/x.jpg')
  expect(m).toMatchObject({ title: 'Liên hệ', description: 'Mô tả ngắn', alternates: { canonical: '/lien-he' }, openGraph: { url: '/lien-he', images: ['/img/x.jpg'] } })
})

test('seo() defaults description and truncates to 160 chars', () => {
  expect(DEFAULT_DESC.startsWith(String(seo('/', 'x').description).replace(/…$/, ''))).toBe(true)
  const long = seo('/', 'x', 'a'.repeat(300)).description as string
  expect(long.length).toBe(158)
  expect(long.endsWith('…')).toBe(true)
  expect(seo('/', 'x').openGraph).not.toHaveProperty('images')
})

test('SITE_URL has no trailing slash', () => expect(SITE_URL.endsWith('/')).toBe(false))

test('JsonLd escapes "<" so content cannot close the script tag', () => {
  const html = renderToStaticMarkup(<JsonLd data={{ name: '</script><b>x' }} />)
  expect(html).toContain('application/ld+json')
  expect(html).not.toContain('</script><b>')
  expect(html).toContain('\\u003c/script')
})
