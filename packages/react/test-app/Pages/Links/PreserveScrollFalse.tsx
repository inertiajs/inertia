import WithoutScrollRegion from '@/Layouts/WithoutScrollRegion.jsx'
import { Link } from '@inertiajs/react'
import type { Page } from '@inertiajs/core'

const PreserveScrollFalse = ({ foo = 'default' }: { foo?: string }) => {
  const preserveCallback = (page: Page) => {
    console.log(JSON.stringify(page))
    return true
  }

  const preserveCallbackFalse = (page: Page) => {
    console.log(JSON.stringify(page))
    return false
  }

  return (
    <div style={{ height: '800px', width: '600px' }}>
      <span className="text">This is the links page that demonstrates scroll preservation without scroll regions</span>
      <span className="foo">Foo is now {foo}</span>

      <Link href="/links/preserve-scroll-false-page-two" preserve-scroll data={{ foo: 'baz' }} className="preserve">
        Preserve Scroll
      </Link>
      <Link href="/links/preserve-scroll-false-page-two" data={{ foo: 'bar' }} className="reset">
        Reset Scroll
      </Link>

      <Link
        href="/links/preserve-scroll-false-page-two"
        preserveScroll={preserveCallback}
        data={{ foo: 'baz' }}
        className="preserve-callback"
      >
        Preserve Scroll (Callback)
      </Link>
      <Link
        href="/links/preserve-scroll-false-page-two"
        preserveScroll={preserveCallbackFalse}
        data={{ foo: 'foo' }}
        className="reset-callback"
      >
        Reset Scroll (Callback)
      </Link>

      <a href="/non-inertia" className="off-site">
        Off-site link
      </a>
    </div>
  )
}

PreserveScrollFalse.layout = (page: React.ReactNode) => <WithoutScrollRegion children={page} />

export default PreserveScrollFalse
