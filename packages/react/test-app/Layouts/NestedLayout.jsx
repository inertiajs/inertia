import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default ({ children }) => {
  const [createdAt, setCreatedAt] = useState(Date.now())

  useEffect(() => {
    window._inertia_nested_layout_id = id
    window._inertia_nested_layout_props = usePage().props
  })

  return (
    <div>
      <span>Nested Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
