import { Link } from '@inertiajs/react'

export default ({ children }) => {
  return (
    <div>
      <Link href="/prefetch/1" prefetch>
        On Hover (Default)
      </Link>
      <Link href="/prefetch/2" prefetch="mount">
        On Mount
      </Link>
      <Link href="/prefetch/3" prefetch="click">
        On Click
      </Link>
      <Link href="/prefetch/4" prefetch={['hover', 'mount']} cacheFor="1s">
        On Hover + Mount
      </Link>
      <Link href="/prefetch/5" prefetch="mount" cacheFor="0">
        On Mount (Once)
      </Link>
      <div>{children}</div>
    </div>
  )
}
