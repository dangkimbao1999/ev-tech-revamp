# EVTECH – Website + CMS

Next.js 16 (App Router) + **Payload CMS 3** (admin & API chạy chung trong app) + PostgreSQL.

## Chạy local

```bash
docker compose up -d      # Postgres ở cổng 5433
bun install
bun run seed              # nạp dữ liệu từ web cũ evtech.vn (seed-data/), bỏ qua nếu đã có
bun run dev               # http://localhost:3000  ·  CMS: /admin (lần đầu tạo tài khoản admin)
```

Dùng Supabase thay Postgres local: đặt `DATABASE_URL` = connection string của Supabase (Session pooler) trong `.env`.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ |
| `/dong-xe/[slug]`, `/he-thong/[slug]`, `/san-pham?q=` | Danh sách phụ tùng (lọc, sắp xếp, phân trang) |
| `/san-pham/[slug]` | Chi tiết sản phẩm |
| `/gara-dai-ly`, `/lien-he` | Form đăng ký đối tác / liên hệ → lưu vào CMS (Liên hệ & Đăng ký) |
| `/gioi-thieu`, `/huong-dan-dat-hang`, `/thanh-toan-giao-hang` | Trang nội dung (CMS → Trang nội dung) |
| `/bai-viet` | Bài viết (ẩn khỏi menu khi chưa có bài) |
| `/admin`, `/api/*` | Payload CMS + REST/GraphQL |

CMS quản lý: Sản phẩm, Dòng xe, Hệ thống, Bài viết, Liên hệ & Đăng ký, Media, Thông tin công ty (hotline, địa chỉ, MXH).

Dữ liệu & ảnh:
- `seed-data/catalog.json` + `seed-data/img/`: 83 sản phẩm (mô tả, giá, ảnh), 9 dòng xe, 8 hệ thống, 3 trang nội dung (Giới thiệu, Thanh toán & giao hàng, Hướng dẫn đặt hàng), crawl từ evtech.vn ngày 2026-11-01.
- `bun run seed:fresh`: xoá sản phẩm/dòng xe/hệ thống/trang/bài viết/media rồi nạp lại từ `seed-data/` (giữ tài khoản admin và liên hệ khách gửi).
- Ảnh upload qua CMS: lưu ở `./media` (local) hoặc Supabase Storage khi có `S3_*` trong `.env`. Deploy: điền `S3_*` rồi chạy seed để ảnh lên Supabase.
- `public/img/`: ảnh cứng của giao diện (logo, hero, banner).

Kiểm tra: `bun src/lib/validate.check.ts` · `bun src/lib/blocks-to-lexical.check.ts`
