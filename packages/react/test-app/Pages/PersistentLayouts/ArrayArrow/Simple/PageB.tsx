import { Link, usePage } from '@inertiajs/react'
import SiteLayout from '@/Layouts/SiteLayout'

const PageB = () => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/array-arrow/simple/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = [SiteLayout]

export default PageB
