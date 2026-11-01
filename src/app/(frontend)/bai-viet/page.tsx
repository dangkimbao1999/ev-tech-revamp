import { ArticleCard, Crumb, SecHead } from '@/components/shared'
import { db } from '@/lib/data'
import { seo } from '@/lib/seo'

export const metadata = seo('/bai-viet', 'Bài viết kỹ thuật & tin tức', 'Kiến thức kỹ thuật, kinh nghiệm bảo dưỡng và hướng dẫn chọn phụ tùng cho xe ô tô điện VinFast.')

export default async function Articles() {
  const { docs } = await (await db()).find({ collection: 'articles', limit: 48, depth: 1, overrideAccess: false })
  return (
    <div className="view">
      <section className="page-hero">
        <div className="wrap">
          <Crumb items={[['Bài viết']]} />
          <div style={{ marginTop: 24 }}><SecHead h1 ov="Bài viết" t="Kiến thức kỹ thuật" h="& tin tức" /></div>
        </div>
      </section>
      <section className="sec2" style={{ paddingBottom: 96 }}>
        <div className="wrap grid4" style={{ gap: 24 }}>
          {docs.length ? docs.map((a) => <ArticleCard key={a.id} a={a} />) : <p className="t2">Chưa có bài viết.</p>}
        </div>
      </section>
    </div>
  )
}
