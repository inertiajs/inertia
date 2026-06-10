import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export default ({ children }: { children: React.ReactNode }) => {
  const [lastNavigateCached, setLastNavigateCached] = useState('none')
  const registered = useRef(false)

  useEffect(() => {
    if (registered.current) {
      return
    }

    registered.current = true

    router.on('navigate', (event) => {
      setLastNavigateCached(String(event.detail.cached))
    })
  }, [])

  return (
    <div>
      <div>
        Last navigate cached: <span id="last-navigate-cached">{lastNavigateCached}</span>
      </div>
      {children}
    </div>
  )
}
