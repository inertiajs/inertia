import { Link, router, useForm } from '@inertiajs/react'

export default ({ pageNumber, lastLoaded, propType }: { pageNumber: number; lastLoaded: number; propType: string }) => {
  const form = useForm({
    name: '',
  })

  const flushUserTags = () => {
    router.flushByCacheTags(propType === 'string' ? 'user' : ['user'])
  }

  const flushUserProductTags = () => {
    router.flushByCacheTags(['user', 'product'])
  }

  const programmaticPrefetch = () => {
    router.prefetch('/prefetch/tags/2', { method: 'get' }, { cacheTags: propType === 'string' ? 'user' : ['user'] })
    router.prefetch(
      '/prefetch/tags/3',
      { method: 'get' },
      { cacheFor: '1m', cacheTags: propType === 'string' ? 'product' : ['product'] },
    )
    router.prefetch(
      '/prefetch/tags/6',
      { method: 'get' },
      { cacheFor: '1m' }, // No tags (untagged)
    )
  }

  const submitWithUserInvalidation = (e: React.MouseEvent) => {
    e.preventDefault()
    form.post('/dump/post', {
      invalidateCacheTags: propType === 'string' ? 'user' : ['user'],
    })
  }

  return (
    <div>
      <div id="links">
        <Link href="/prefetch/tags/1" prefetch="hover" cacheTags={['user', 'profile']}>
          User Page 1
        </Link>
        <Link href="/prefetch/tags/2" prefetch="hover" cacheTags={['user', 'settings']}>
          User Page 2
        </Link>
        <Link href="/prefetch/tags/3" prefetch="hover" cacheTags={['product', 'catalog']}>
          Product Page 3
        </Link>
        <Link href="/prefetch/tags/4" prefetch="hover" cacheTags={['product', 'details']}>
          Product Page 4
        </Link>
        <Link href="/prefetch/tags/5" prefetch="hover" cacheTags={propType === 'string' ? 'admin' : ['admin']}>
          Admin Page 5
        </Link>
        <Link href="/prefetch/tags/6" prefetch="hover">
          Untagged Page 6
        </Link>
      </div>
      <div id="controls">
        <button id="flush-user" onClick={flushUserTags}>
          Flush User Tags
        </button>
        <button id="flush-user-product" onClick={flushUserProductTags}>
          Flush User + Product Tags
        </button>
        <button id="programmatic-prefetch" onClick={programmaticPrefetch}>
          Programmatic Prefetch
        </button>
      </div>

      <div id="form-section">
        <h3>Form Test</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            id="form-name"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            type="text"
            placeholder="Enter name"
          />
          <button id="submit-invalidate-user" onClick={submitWithUserInvalidation}>
            Submit (Invalidate User)
          </button>
        </form>
      </div>

      <div>
        <div>This is tags page {pageNumber}</div>
        <div>
          Last loaded at <span id="last-loaded">{lastLoaded}</span>
        </div>
      </div>
    </div>
  )
}