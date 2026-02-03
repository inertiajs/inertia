import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'

const Static = () => {
  return (
    <div>
      <h2>Static Layout Props Page</h2>
      <p>This page uses static props defined in the layout tuple.</p>
      <p>The title should be "Static Props Page", sidebar should be hidden, theme should be "dark".</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

Static.layout = [AppLayout, { title: 'Static Props Page', showSidebar: false, theme: 'dark' }]

export default Static
