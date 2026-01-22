import { router } from '@inertiajs/react'
import { useRef } from 'react'

export default ({ page }: { page: number }) => {
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startScrollingAndNavigate = () => {
    const container = document.getElementById('scroll-container')!
    const nextPage = page === 1 ? 2 : 1

    // Start continuous scrolling
    scrollIntervalRef.current = setInterval(() => {
      container.scrollTop += 10
    }, 10)

    // After 150ms of scrolling, navigate to the other page
    setTimeout(() => {
      router.visit(`/scroll-region-preserve-url/${nextPage}`, {
        preserveScroll: true,
        preserveState: true,
        preserveUrl: true,
        onSuccess: () => {
          // Stop scrolling after navigation
          if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current)
            scrollIntervalRef.current = null
          }
        },
      })
    }, 150)
  }

  return (
    <div
      scroll-region=""
      id="scroll-container"
      style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc' }}
    >
      <div style={{ padding: '10px' }}>
        <div className="page-number">Page: {page}</div>
        <button id="scroll-and-navigate" onClick={startScrollingAndNavigate}>
          Start scrolling and navigate
        </button>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
