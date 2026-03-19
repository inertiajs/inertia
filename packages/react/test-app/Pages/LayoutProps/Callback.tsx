import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'

const Callback = () => {
  return (
    <div>
      <h2>Callback Layout Props Page</h2>
      <p>This page uses a layout callback to derive props from page props.</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

Callback.layout = (props: Record<string, unknown>) => [
  AppLayout,
  { title: 'Profile: ' + props.userName, showSidebar: false },
]

export default Callback
