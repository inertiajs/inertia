import { router } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ mode }: { mode: 'stylesheet' | 'inline' }) => {
  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  useEffect(() => {
    let styleTag: HTMLStyleElement | null = null

    if (mode === 'stylesheet') {
      styleTag = document.createElement('style')
      styleTag.id = 'body-overflow-style'
      styleTag.textContent = 'body { overflow-y: scroll; }'
      document.head.appendChild(styleTag)
    } else {
      document.body.style.overflow = 'scroll'
    }

    return () => {
      if (styleTag) {
        styleTag.remove()
      }
      if (mode === 'inline') {
        document.body.style.overflow = ''
      }
    }
  }, [mode])

  return (
    <div>
      <span onClick={invalidVisit} className="invalid-visit">
        Invalid Visit
      </span>
    </div>
  )
}
