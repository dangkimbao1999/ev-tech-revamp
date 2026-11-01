// Converts the compact block format in seed-data/catalog.json into Payload Lexical rich text.
export type Inline = { x: string; b?: 1; i?: 1; u?: 1; a?: string }
export type Block =
  | { t: 'p' | 'h2' | 'h3' | 'quote'; c: Inline[] }
  | { t: 'ul' | 'ol'; items: Inline[][] }
  | { t: 'img'; file: string }

const base = { direction: 'ltr', format: '', indent: 0, version: 1 }
const cleanText = (s: string) => s.replace(/\s*\|\s*EVTech\s*$/i, '')

function inline(c: Inline[]) {
  const out: object[] = []
  for (const r of c) {
    const format = (r.b ? 1 : 0) | (r.i ? 2 : 0) | (r.u ? 8 : 0)
    r.x.split('\n').forEach((part, k) => {
      if (k) out.push({ type: 'linebreak', version: 1 })
      if (!part) return
      const text = { type: 'text', text: cleanText(part), format, style: '', mode: 'normal', detail: 0, version: 1 }
      // Old relative links ("xyz.html") become root-relative; next.config redirects map them to new URLs.
      out.push(r.a && !/^(javascript|#)/.test(r.a) ? { ...base, type: 'link', version: 3, fields: { url: /^(https?:|mailto:|tel:|\/)/.test(r.a) ? r.a : '/' + r.a, newTab: false, linkType: 'custom' }, children: [text] } : text)
    })
  }
  // trim leading/trailing whitespace-only text
  while (out.length && (out[0] as { type: string }).type === 'linebreak') out.shift()
  return out
}

export function blocksToLexical(blocks: Block[], mediaId: (file: string) => number | undefined) {
  const children = blocks.flatMap((b): object[] => {
    if (b.t === 'img') {
      const id = mediaId(b.file)
      return id ? [{ type: 'upload', version: 3, format: '', id: `img${id}${Math.random().toString(36).slice(2, 8)}`, fields: null, relationTo: 'media', value: id }] : []
    }
    if (b.t === 'ul' || b.t === 'ol')
      return [{ ...base, type: 'list', listType: b.t === 'ul' ? 'bullet' : 'number', tag: b.t, start: 1, children: b.items.map((it, i) => ({ ...base, type: 'listitem', value: i + 1, children: inline(it) })) }]
    const kids = inline((b as { c: Inline[] }).c)
    if (!kids.length) return []
    if (b.t === 'h2' || b.t === 'h3') return [{ ...base, type: 'heading', tag: b.t, children: kids }]
    if (b.t === 'quote') return [{ ...base, type: 'quote', children: kids }]
    return [{ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: kids }]
  })
  return children.length ? { root: { ...base, type: 'root', children } } : null
}
