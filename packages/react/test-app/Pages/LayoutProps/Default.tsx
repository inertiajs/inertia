import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'

const Default = () => {
  return (
    <div>
      <h2>Default Layout Props Page</h2>
      <p>This page does not set any layout props. All defaults should apply.</p>

      <nav>
        <Link href="/layout-props/static">Go to Static Page</Link>
      </nav>
    </div>
  )
}

Default.layout = AppLayout

export default Default
