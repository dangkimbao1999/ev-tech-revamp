import { expect, test } from 'vitest'
import { blocksToLexical } from './blocks-to-lexical'

const mediaId = (f: string) => (f === 'a.webp' ? 7 : undefined)

test('converts headings, inline formats, links, lists and images', () => {
  const r = blocksToLexical(
    [
      { t: 'h2', c: [{ x: 'Má phanh VF5 | EVTech' }] },
      { t: 'p', c: [{ x: 'Dòng 1\nDòng ' }, { x: '2', b: 1 }, { x: ' xem', a: 'lienhe.html' }] },
      { t: 'ol', items: [[{ x: 'A' }], [{ x: 'B' }]] },
      { t: 'quote', c: [{ x: 'Trích dẫn', i: 1 }] },
      { t: 'img', file: 'a.webp' },
    ],
    mediaId,
  ) as { root: { children: any[] } }
  const [h, p, ol, q, img] = r.root.children
  expect(h).toMatchObject({ type: 'heading', tag: 'h2' })
  expect(h.children[0].text).toBe('Má phanh VF5') // "| EVTech" suffix stripped
  expect(p.children.map((c: any) => c.type)).toEqual(['text', 'linebreak', 'text', 'text', 'link'])
  expect(p.children[3].format).toBe(1)
  expect(p.children[4].fields.url).toBe('/lienhe.html')
  expect(ol).toMatchObject({ type: 'list', listType: 'number', tag: 'ol' })
  expect(ol.children).toHaveLength(2)
  expect(q.children[0].format).toBe(2)
  expect(img).toMatchObject({ type: 'upload', relationTo: 'media', value: 7 })
})

test('keeps absolute links and ignores javascript: links', () => {
  const r = blocksToLexical([{ t: 'p', c: [{ x: 'a', a: 'https://evtech.vn' }, { x: 'b', a: 'javascript:' }] }], mediaId) as any
  const [a, b] = r.root.children[0].children
  expect(a.fields.url).toBe('https://evtech.vn')
  expect(b.type).toBe('text')
})

test('drops unknown images and empty paragraphs; empty input -> null', () => {
  const r = blocksToLexical([{ t: 'img', file: 'missing.webp' }, { t: 'p', c: [{ x: '' }] }, { t: 'h3', c: [{ x: 'Ok' }] }], mediaId) as any
  expect(r.root.children).toHaveLength(1)
  expect(blocksToLexical([], mediaId)).toBeNull()
})
