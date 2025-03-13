import { usePage } from '@inertiajs/react'
import { useId, useState } from 'react'

export default ({ children }) => {
  const [createdAt, setCreatedAt] = useState(Date.now())

  window._inertia_nested_layout_id = useId()
  window._inertia_nested_layout_props = usePage().props

  return (
    <div>
      <span>Nested Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
