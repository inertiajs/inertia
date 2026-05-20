import { Link } from '@inertiajs/react'
import SiteLayout from '@/Layouts/SiteLayout'

const PageA = () => {
  return (
    <div>
      <span className="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/render-function/simple/page-b">Page B</Link>
    </div>
  )
}

PageA.layout = (page: React.ReactNode) => <SiteLayout children={page} />

export default PageA
