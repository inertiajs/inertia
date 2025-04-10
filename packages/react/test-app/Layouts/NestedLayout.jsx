import { UsePage } from '@inertiajs/react'
import { useId, useState } from 'react'

export default ({ children }) => {
  const [createdAt, setCreatedAt] = useState(Date.now())

  window._inertia_nested_layout_id = useId()
  window._inertia_nested_layout_props = UsePage().props

  return (
    <div>
      <span>Nested Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
