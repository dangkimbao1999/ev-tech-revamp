// Prefetched for every route, so navigation shows this instantly while the server renders the page.
export default function Loading() {
  return (
    <div className="view page-loading" role="status" aria-live="polite">
      <span className="spin" />
      Đang tải…
    </div>
  )
}
