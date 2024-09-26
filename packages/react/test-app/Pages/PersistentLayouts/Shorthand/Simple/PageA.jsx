import SiteLayout from '@/Layouts/SiteLayout'
import { Link, usePage } from '@inertiajs/react'

const PageA = (props) => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
    </div>
  )
}

PageA.layout = (page) => <SiteLayout children={page} />

export default PageA
