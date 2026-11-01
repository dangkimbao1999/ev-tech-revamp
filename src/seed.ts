// Seed catalog from seed-data/catalog.json (crawled from the old evtech.vn) + seed-data/img/.
//   bun run seed        -> only if the DB has no catalog yet
//   bun run seed:fresh  -> delete products/vehicles/systems/pages/articles/media first (keeps users + leads)
// Images go through the Media collection, so they land in ./media locally or Supabase Storage when S3_* is set.
import config from '@payload-config'
import { readFileSync } from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { type Block, blocksToLexical } from './lib/blocks-to-lexical'

type Catalog = {
  vehicles: { name: string; slug: string; order: number; image: string }[]
  systems: {
    name: string
    slug: string
    description: string
    order: number
    image: string | null
  }[]
  products: {
    oldId: number
    name: string
    slug: string
    price: number | null
    system: string
    vehicles: string[]
    position: string | null
    images: string[]
    featured?: boolean
    blocks: Block[]
  }[]
  pages: { title: string; slug: string; blocks: Block[] }[]
}
const DIR = path.resolve('seed-data')
const data: Catalog = JSON.parse(readFileSync(path.join(DIR, 'catalog.json'), 'utf8'))
const payload = await getPayload({ config })

if (process.env.SEED_FRESH) {
  for (const collection of [
    'products',
    'pages',
    'articles',
    'vehicles',
    'systems',
    'media',
  ] as const) {
    const { docs } = await payload.delete({ collection, where: { id: { exists: true } } })
    payload.logger.info(`Deleted ${docs.length} ${collection}`)
  }
}

if ((await payload.count({ collection: 'products' })).totalDocs)
  payload.logger.info('Catalog already exists, skipping (use bun run seed:fresh to rebuild)')
else await seedCatalog()
process.exit(0)

async function seedCatalog() {
  // Upload each image once; reuse by filename.
  const media = new Map<string, number>()
  const upload = async (file: string, alt: string) => {
    if (!media.has(file)) {
      const found = (
        await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1 })
      ).docs[0]
      media.set(
        file,
        found?.id ??
          (
            await payload.create({
              collection: 'media',
              data: { alt },
              filePath: path.join(DIR, 'img', file),
            })
          ).id,
      )
    }
    return media.get(file)!
  }
  const richText = async (blocks: Block[], alt: string) => {
    for (const b of blocks) if (b.t === 'img') await upload(b.file, alt)
    return blocksToLexical(blocks, (f) => media.get(f))
  }

  const vehicles = new Map<string, number>()
  for (const v of data.vehicles)
    vehicles.set(
      v.name,
      (
        await payload.create({
          collection: 'vehicles',
          data: {
            name: v.name,
            slug: v.slug,
            order: v.order,
            image: await upload(v.image, v.name),
          },
        })
      ).id,
    )

  const systems = new Map<string, number>()
  for (const s of data.systems)
    systems.set(
      s.name,
      (
        await payload.create({
          collection: 'systems',
          data: {
            name: s.name,
            slug: s.slug,
            description: s.description,
            order: s.order,
            image: s.image ? await upload(s.image, s.name) : undefined,
          },
        })
      ).id,
    )

  for (const p of data.products) {
    const images = []
    for (const f of p.images) images.push(await upload(f, p.name))
    await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        slug: p.slug,
        sku: `EVT-${p.oldId}`,
        price: p.price ?? undefined,
        system: systems.get(p.system)!,
        vehicles: p.vehicles.map((v) => vehicles.get(v)!).filter(Boolean),
        images,
        position: p.position ?? undefined,
        featured: !!p.featured,
        inStock: true,
        description: (await richText(p.blocks, p.name)) as never,
      },
    })
  }

  for (const pg of data.pages) {
    const firstText = pg.blocks.find((b) => b.t === 'p') as { c: { x: string }[] } | undefined
    await payload.create({
      collection: 'pages',
      data: {
        title: pg.title,
        slug: pg.slug,
        description: firstText?.c
          .map((x) => x.x)
          .join('')
          .trim()
          .slice(0, 160),
        content: (await richText(pg.blocks, pg.title)) as never,
      },
    })
  }

  payload.logger.info(
    `Seed done: ${data.vehicles.length} vehicles, ${data.systems.length} systems, ${data.products.length} products, ${data.pages.length} pages, ${media.size} images`,
  )
}
