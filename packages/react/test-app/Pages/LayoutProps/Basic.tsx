import { Link, setLayoutProps } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '../../Layouts/AppLayout'

const Basic = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // Call setLayoutProps during render (not in useEffect) so it runs before the layout renders
  setLayoutProps({
    title: 'Basic Layout Props',
    showSidebar: sidebarVisible,
  })

  return (
    <div>
      <h2>Basic Layout Props Page</h2>
      <p>This page demonstrates setting layout props dynamically.</p>

      <div>
        <button type="button" onClick={() => setSidebarVisible(!sidebarVisible)}>
          Toggle Sidebar
        </button>
        <span>Sidebar: {sidebarVisible ? 'visible' : 'hidden'}</span>
      </div>

      <nav>
        <Link href="/layout-props/navigate">Go to Navigate Page</Link>
      </nav>
    </div>
  )
}

Basic.layout = AppLayout

export default Basic
