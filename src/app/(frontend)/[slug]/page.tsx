import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { Crumb, SecHead, Services } from '@/components/shared'
import { db } from '@/lib/data'
import { seo } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }
const get = async (slug: string) => (await (await db()).find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 1 })).docs[0]

export async function generateMetadata({ params }: Props) {
  const p = await get((await params).slug)
  return p ? seo(`/${p.slug}`, p.title, p.description || undefined) : {}
}

export default async function ContentPage({ params }: Props) {
  const p = await get((await params).slug)
  if (!p) notFound()
  return (
    <div className="view">
      <section className="page-hero">
        <div className="wrap">
          <Crumb items={[[p.title]]} />
          <div style={{ marginTop: 24 }}>
            <SecHead h1 ov="EVTECH" t="" h={p.title} />
          </div>
        </div>
      </section>
      <div className="wrap c-layout" style={{ paddingBottom: 96 }}>
        <article className="formcard">{p.content && <RichText data={p.content} className="b-lg rich" />}</article>
        <div className="infocol">
          <Services />
        </div>
      </div>
    </div>
  )
}
