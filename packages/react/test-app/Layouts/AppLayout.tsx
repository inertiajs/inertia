import { ReactNode, useId } from 'react'

export default function AppLayout({
  title = 'Default Title',
  showSidebar = true,
  theme = 'light',
  formatTitle,
  children,
}: {
  title?: string
  showSidebar?: boolean
  theme?: string
  formatTitle?: (name: string) => string
  children: ReactNode
}) {
  const layoutId = useId()
  window._inertia_app_layout_id = layoutId

  return (
    <div data-theme={theme} className="app-layout">
      <header>
        <h1 className="app-title">{formatTitle ? formatTitle('User') : title}</h1>
      </header>
      <div className="app-content">
        {showSidebar && (
          <aside className="sidebar">
            <span>Sidebar</span>
          </aside>
        )}
        <main>{children}</main>
      </div>
    </div>
  )
}
