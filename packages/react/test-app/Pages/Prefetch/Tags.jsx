import { Link, router } from '@inertiajs/react'

export default ({ pageNumber, lastLoaded }) => {
  const flushUserTags = () => {
    router.flushByTags(['user'])
  }

  const flushUserProductTags = () => {
    router.flushByTags(['user', 'product'])
  }

  return (
    <div>
      <div id="links">
        <Link href="/prefetch/tags/1" prefetch="hover" tags={['user', 'profile']}>
          User Page 1
        </Link>
        <Link href="/prefetch/tags/2" prefetch="hover" tags={['user', 'settings']}>
          User Page 2
        </Link>
        <Link href="/prefetch/tags/3" prefetch="hover" tags={['product', 'catalog']}>
          Product Page 3
        </Link>
        <Link href="/prefetch/tags/4" prefetch="hover" tags={['product', 'details']}>
          Product Page 4
        </Link>
        <Link href="/prefetch/tags/5" prefetch="hover" tags={['admin']}>
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