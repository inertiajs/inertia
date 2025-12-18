import { router } from '@inertiajs/react'
import { useEffect, useId, useState } from 'react'

declare global {
  interface Window {
    _inertia_flash_events: unknown[]
    _inertia_flash_layout_id: string | undefined
  }
}

window._inertia_flash_events = window._inertia_flash_events || []

export default ({ children }: { children: React.ReactNode }) => {
  const layoutId = useId()
  const [flashCount, setFlashCount] = useState(window._inertia_flash_events.length)

  useEffect(() => {
    window._inertia_flash_layout_id = layoutId

    return router.on('flash', (event) => {
      window._inertia_flash_events.push(event.detail.flash)
      setFlashCount(window._inertia_flash_events.length)
    })
  }, [layoutId])

  return (
    <div>
      <span className="layout-id">{layoutId}</span>
      <span className="flash-count">{flashCount}</span>
      {children}
    </div>
  )
}
