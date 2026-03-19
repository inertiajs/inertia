import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'

const Navigate = () => {
  return (
    <div>
      <h2>Navigate Page</h2>
      <p>This page sets different layout props to test reset on navigation.</p>
      <p>Title should be "Navigate Page", sidebar hidden, theme dark.</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page (props should reset)</Link>
      </nav>
    </div>
  )
}

Navigate.layout = [AppLayout, { title: 'Navigate Page', showSidebar: false, theme: 'dark' }]

export default Navigate
