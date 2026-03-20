import { ReactNode } from 'react'

export default function SSRLayout({ title = 'Default Title', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="ssr-layout">
      <h1 data-testid="layout-title">{title}</h1>
      {children}
    </div>
  )
}
