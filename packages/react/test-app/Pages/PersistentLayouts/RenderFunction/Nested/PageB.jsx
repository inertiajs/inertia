import NestedLayout from '@/Layouts/NestedLayout.jsx'
import SiteLayout from '@/Layouts/SiteLayout.jsx'
import { Link } from '@inertiajs/react'

const PageB = (props) => {
  return (
    <div>
      <span className="text">Nested Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/render-function/nested/page-a">Page A</Link>
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
