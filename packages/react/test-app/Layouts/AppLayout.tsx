import { useLayoutProps } from '@inertiajs/react'
import { ReactNode, useId } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const layoutId = useId()
  window._inertia_app_layout_id = layoutId

  const layoutProps = useLayoutProps({
    title: 'Default Title',
    showSidebar: true,
    theme: 'light',
  })

  return (
    <div data-theme={layoutProps.theme} className="app-layout">
      <header>
        <h1 className="app-title">{layoutProps.title}</h1>
      </header>
      <div className="app-content">
        {layoutProps.showSidebar && (
          <aside className="sidebar">
            <span>Sidebar</span>
          </aside>
        )}
        <main>{children}</main>
      </div>
    </div>
  )
}
