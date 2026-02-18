import { Link, router, usePage } from '@inertiajs/react'

export default () => {
  const page = usePage()

  const visitWithFragment = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect#my-fragment')
  }

  return (
    <div>
      <span id="current-url">{page.url}</span>

      <Link href="/preserve-fragment/redirect#my-fragment" id="link-with-fragment">
        Link with fragment
      </Link>

      <a href="#" onClick={visitWithFragment} id="manual-visit-with-fragment">
        Manual visit with fragment
      </a>
    </div>
  )
}
