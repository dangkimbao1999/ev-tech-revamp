import type { CollectionConfig } from 'payload'
import { slugField } from '../lib/slug'

const publicRead = { read: () => true }

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  labels: { singular: 'Dòng xe', plural: 'Dòng xe' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order'], group: 'Danh mục' },
  defaultSort: 'order',
  access: publicRead,
  fields: [
    { name: 'name', label: 'Tên dòng xe', type: 'text', required: true },
    { name: 'image', label: 'Ảnh xe', type: 'upload', relationTo: 'media' },
    { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0 },
    slugField('name'),
  ],
}

export const Systems: CollectionConfig = {
  slug: 'systems',
  labels: { singular: 'Hệ thống', plural: 'Hệ thống phụ tùng' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'description', 'order'], group: 'Danh mục' },
  defaultSort: 'order',
  access: publicRead,
  fields: [
    { name: 'name', label: 'Tên hệ thống', type: 'text', required: true },
    { name: 'description', label: 'Mô tả ngắn', type: 'text' },
    { name: 'image', label: 'Ảnh', type: 'upload', relationTo: 'media' },
    { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0 },
    slugField('name'),
  ],
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'sku', 'price', 'system', 'featured'], group: 'Danh mục' },
  access: publicRead,
  fields: [
    { name: 'name', label: 'Tên sản phẩm', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'sku', label: 'Mã sản phẩm', type: 'text', index: true },
        { name: 'price', label: 'Giá chỉ từ (₫)', type: 'number', min: 0, admin: { description: 'Để trống = "Liên hệ báo giá"' } },
      ],
    },
    { name: 'system', label: 'Hệ thống', type: 'relationship', relationTo: 'systems', required: true },
    { name: 'vehicles', label: 'Dòng xe tương thích', type: 'relationship', relationTo: 'vehicles', hasMany: true },
    { name: 'images', label: 'Ảnh', type: 'upload', relationTo: 'media', hasMany: true },
    {
      type: 'row',
      fields: [
        { name: 'position', label: 'Vị trí lắp đặt', type: 'text' },
        { name: 'warranty', label: 'Bảo hành', type: 'text' },
        { name: 'origin', label: 'Xuất xứ', type: 'text' },
      ],
    },
    { name: 'description', label: 'Mô tả', type: 'richText' },
    { name: 'inStock', label: 'Còn hàng', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'featured', label: 'Sản phẩm nổi bật (trang chủ)', type: 'checkbox', admin: { position: 'sidebar' } },
    slugField('name'),
  ],
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Bài viết', plural: 'Bài viết' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'publishedAt'] },
  defaultSort: '-publishedAt',
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  versions: { drafts: true },
  fields: [
    { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
    { name: 'cover', label: 'Ảnh bìa', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', label: 'Tóm tắt', type: 'textarea' },
    { name: 'content', label: 'Nội dung', type: 'richText' },
    { name: 'publishedAt', label: 'Ngày đăng', type: 'date', defaultValue: () => new Date(), admin: { position: 'sidebar' } },
    slugField('title'),
  ],
}

/** Liên hệ + đăng ký đại lý. Public chỉ ghi được qua server action (có validate), không qua REST. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Yêu cầu', plural: 'Liên hệ & Đăng ký' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kind', 'phone', 'status', 'createdAt'] },
  defaultSort: '-createdAt',
  access: { read: ({ req }) => !!req.user, create: ({ req }) => !!req.user },
  fields: [
    {
      name: 'kind',
      label: 'Loại',
      type: 'select',
      required: true,
      options: [
        { label: 'Liên hệ / báo giá', value: 'contact' },
        { label: 'Đăng ký đối tác', value: 'partner' },
      ],
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Mới', value: 'new' },
        { label: 'Đã liên hệ', value: 'contacted' },
        { label: 'Hoàn tất', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', label: 'Họ tên / Đơn vị', type: 'text', required: true },
    { name: 'contactPerson', label: 'Người liên hệ', type: 'text' },
    { name: 'org', label: 'Đơn vị', type: 'text' },
    { name: 'phone', label: 'Điện thoại', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Địa chỉ', type: 'text' },
    { name: 'area', label: 'Khu vực', type: 'text' },
    { name: 'partnerType', label: 'Loại hình đối tác', type: 'text' },
    { name: 'message', label: 'Nội dung', type: 'textarea', required: true },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Trang', plural: 'Trang nội dung' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'], description: 'Hiển thị tại evtech.vn/<slug>, ví dụ /gioi-thieu' },
  access: publicRead,
  fields: [
    { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
    { name: 'description', label: 'Mô tả SEO', type: 'textarea' },
    { name: 'content', label: 'Nội dung', type: 'richText' },
    slugField('title'),
  ],
}
