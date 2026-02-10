import { useLayoutProps } from '@inertiajs/react'
import { ReactNode } from 'react'

export default function ContentLayout({ children }: { children: ReactNode }) {
  const layoutProps = useLayoutProps({
    padding: 'md',
    maxWidth: 'lg',
  })

  return (
    <div className="content-layout" data-padding={layoutProps.padding} data-max-width={layoutProps.maxWidth}>
      <div className="content-wrapper">{children}</div>
    </div>
  )
}
