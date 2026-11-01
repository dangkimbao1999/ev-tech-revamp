import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingBlock: 120, textAlign: 'center', display: 'grid', gap: 16, justifyItems: 'center' }}>
      <h1 className="h2 navy" style={{ margin: 0 }}>Không tìm thấy trang</h1>
      <p className="t2">Trang bạn tìm có thể đã bị xoá hoặc đổi địa chỉ.</p>
      <Link className="btn green lg" href="/">Về trang chủ</Link>
    </div>
  )
}
