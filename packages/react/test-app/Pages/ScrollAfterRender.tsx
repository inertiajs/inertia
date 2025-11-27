import { Link } from '@inertiajs/react'

export default ({ page }: { page: number }) => {
  // Patch scrollTo to log synchronously when it's called (not when the scroll event fires)
  if (!window._scroll_to_patched) {
    window._scroll_to_patched = true

    const originalScrollTo = window.scrollTo.bind(window)

    window.scrollTo = (...args: any[]) => {
      const y = typeof args[0] === 'number' ? args[1] : (args[0]?.top ?? 0)

      console.log('ScrollY', y)

      return originalScrollTo(...args)
    }
  }

  console.log('Render')

  return (
    <>
      <h1 style={{ fontSize: '40px' }}>Article Header</h1>
      <h2 style={{ fontSize: '40px' }}>Page {page}</h2>
      <article style={{ fontSize: '20px', maxWidth: '500px', height: '2000px' }}>
        <p>
          Sunt culpa sit sunt enim aliquip. Esse ea ea quis voluptate. Enim consectetur aliqua ex ex magna cupidatat id
          minim sit elit.
        </p>
        <Link
          href={`/scroll-after-render/${page + 1}`}
          style={{ display: 'block', marginTop: '20px' }}
          onBefore={() => window.scrollTo(0, 100)}
        >
          Go to page {page + 1}
        </Link>
      </article>
    </>
  )
}
