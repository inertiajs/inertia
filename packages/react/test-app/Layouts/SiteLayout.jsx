import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { getCurrentInstance } from 'vue'

export default ({ children }) => {
  const [createdAt, setCreatedAt] = useState(Date.now())

  useEffect(() => {
    window._inertia_layout_id = getCurrentInstance().uid
    window._inertia_site_layout_props = usePage().props
  })

  return (
    <div>
      <span>Site Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
