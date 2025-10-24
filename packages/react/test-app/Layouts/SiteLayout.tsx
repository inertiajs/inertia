import { usePage } from '@inertiajs/react'
import { useId, useState } from 'react'

export default ({ children }: { children: React.ReactNode }) => {
  const [createdAt] = useState(Date.now())

  window._inertia_layout_id = useId()
  window._inertia_site_layout_props = usePage().props

  return (
    <div>
      <span>Site Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
