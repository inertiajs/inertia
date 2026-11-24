import { Link, router, usePage } from '@inertiajs/react'

export default () => {
  const page = usePage()

  const visitWithFragment = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect#my-fragment')
  }

  const getWithPreserveFragment = (e: React.MouseEvent) => {
    e.preventDefault()
    router.get('/preserve-fragment', { status: 'open' }, { preserveFragment: true })
  }

  const getWithoutPreserveFragment = (e: React.MouseEvent) => {
    e.preventDefault()
    router.get('/preserve-fragment', { status: 'open' })
  }

  const redirectWithPreserveFragment = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect-no-server-flag', { preserveFragment: true })
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

      <Link href="/preserve-fragment?status=open" preserveFragment id="link-preserve-fragment">
        Link preserve fragment
      </Link>

      <a href="#" onClick={getWithPreserveFragment} id="visit-preserve-fragment">
        Visit preserve fragment
      </a>

      <a href="#" onClick={getWithoutPreserveFragment} id="visit-without-preserve-fragment">
        Visit without preserve fragment
      </a>

      <a href="#" onClick={redirectWithPreserveFragment} id="redirect-preserve-fragment">
        Redirect preserve fragment
      </a>
    </div>
  )
}
