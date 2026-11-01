import type { Field } from 'payload'

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Slug field auto-filled from `from` when left empty. */
export const slugField = (from: string): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Để trống để tự tạo từ tên' },
  hooks: {
    beforeValidate: [({ value, data }) => (value ? slugify(value) : data?.[from] ? slugify(data[from]) : value)],
  },
})
