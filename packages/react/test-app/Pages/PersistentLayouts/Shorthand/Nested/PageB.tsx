import NestedLayout from '@/Layouts/NestedLayout.jsx'
import SiteLayout from '@/Layouts/SiteLayout.jsx'
import { Link, usePage } from '@inertiajs/react'

const PageB = (props) => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Nested Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/shorthand/nested/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = (page) => {
  return (
    <SiteLayout>
      <NestedLayout children={page} />
    </SiteLayout>
  )
}

export default PageB
