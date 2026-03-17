import { useLayoutProps } from '@inertiajs/react'
import { ReactNode } from 'react'

export default function SSRLayout({ children }: { children: ReactNode }) {
  const layoutProps = useLayoutProps({
    title: 'Default Title',
  })

  return (
    <div className="ssr-layout">
      <h1 data-testid="layout-title">{layoutProps.title}</h1>
      {children}
    </div>
  )
}
