import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { Crumb } from '@/components/shared'
import { db, mediaUrl } from '@/lib/data'
import { seo } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }
const get = async (slug: string) => (await (await db()).find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 1, overrideAccess: false })).docs[0]

export async function generateMetadata({ params }: Props) {
  const a = await get((await params).slug)
  if (!a) return {}
  const m = seo(`/bai-viet/${a.slug}`, a.title, a.excerpt || undefined, mediaUrl(a.cover))
  return { ...m, openGraph: { ...m.openGraph, type: 'article', publishedTime: a.publishedAt ?? undefined } }
}

export default async function Article({ params }: Props) {
  const a = await get((await params).slug)
  if (!a) notFound()
  const cover = mediaUrl(a.cover)
  return (
    <div className="view">
      <div className="wrap" style={{ paddingBlock: 16 }}><Crumb items={[['Bài viết', '/bai-viet'], [a.title]]} /></div>
      <article className="wrap" style={{ maxWidth: 820, paddingBottom: 96, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 className="h2 navy" style={{ margin: 0 }}>{a.title}</h1>
        {a.publishedAt && <span className="tm">{new Date(a.publishedAt).toLocaleDateString('vi-VN')}</span>}
        {cover && <img src={cover} alt="" style={{ width: '100%', borderRadius: 16 }} />}
        {a.excerpt && <p className="b-lg t2" style={{ margin: 0 }}>{a.excerpt}</p>}
        {a.content && <RichText data={a.content} className="b-lg" />}
      </article>
    </div>
  )
}
