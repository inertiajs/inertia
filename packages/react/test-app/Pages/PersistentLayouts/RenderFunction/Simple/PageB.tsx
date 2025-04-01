import SiteLayout from '@/Layouts/SiteLayout.jsx'
import { Link } from '@inertiajs/react'

const PageB = (props) => {
  return (
    <div>
      <span className="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/render-function/simple/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = (page) => <SiteLayout children={page} />

export default PageB
