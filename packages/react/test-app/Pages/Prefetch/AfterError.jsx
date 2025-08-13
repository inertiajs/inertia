import { router } from '@inertiajs/react'

export default function AfterError() {
  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }

  return (
    <div>
      <button onClick={prefetchPage}>Prefetch Page</button>
      <button onClick={visitPage}>Visit Page</button>
    </div>
  )
}