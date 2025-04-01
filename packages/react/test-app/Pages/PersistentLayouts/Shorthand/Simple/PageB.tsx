import SiteLayout from '@/Layouts/SiteLayout.jsx'
import { Link, usePage } from '@inertiajs/react'

const PageB = (props) => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/shorthand/simple/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = (page) => <SiteLayout children={page} />

export default PageB
