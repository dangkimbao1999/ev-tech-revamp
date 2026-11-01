import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Articles, Leads, Pages, Products, Systems, Vehicles } from './collections/catalog'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' – EVTECH CMS' },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Products, Vehicles, Systems, Pages, Articles, Leads, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Dev pushes schema automatically; production applies src/migrations on boot.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Supabase Storage (S3-compatible). Without S3_BUCKET, uploads stay on local disk in ./media.
    s3Storage({
      enabled: !!process.env.S3_BUCKET,
      collections: {
        // Public bucket: serve images straight from Supabase CDN instead of proxying through Next.
        media: process.env.S3_PUBLIC_URL
          ? { disablePayloadAccessControl: true, generateFileURL: ({ filename }) => `${process.env.S3_PUBLIC_URL}/${filename}` }
          : true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
