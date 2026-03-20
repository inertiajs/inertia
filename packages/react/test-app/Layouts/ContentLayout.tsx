import { ReactNode, useId } from 'react'

export default function ContentLayout({
  padding = 'md',
  maxWidth = 'lg',
  children,
}: {
  padding?: string
  maxWidth?: string
  children: ReactNode
}) {
  const layoutId = useId()
  window._inertia_content_layout_id = layoutId

  return (
    <div className="content-layout" data-padding={padding} data-max-width={maxWidth}>
      <div className="content-wrapper">{children}</div>
    </div>
  )
}
