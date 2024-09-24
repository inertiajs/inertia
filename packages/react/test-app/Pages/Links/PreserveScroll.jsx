import WithScrollRegion from '@/Layouts/WithScrollRegion.jsx'
import { Link } from '@inertiajs/react'

const PreserveScroll = ({ foo = 'default' }) => {
  const preserveCallback = (page) => {
    alert(page)
    return true
  }
  const preserveCallbackFalse = (page) => {
    alert(page)
    return false
  }

  return (
    <div style={{ height: '800px', width: '600px' }}>
      <span className="text">This is the links page that demonstrates scroll preservation with scroll regions</span>
      <span className="foo">Foo is now {foo}</span>

      <Link href="/links/preserve-scroll-page-two" preserve-scroll data={{ foo: 'baz' }} className="preserve">
        Preserve Scroll
      </Link>
      <Link href="/links/preserve-scroll-page-two" data={{ foo: 'bar' }} className="reset">
        Reset Scroll
      </Link>

      <Link
        href="/links/preserve-scroll-page-two"
        preserveScroll={preserveCallback}
        data={{ foo: 'baz' }}
        className="preserve-callback"
      >
        Preserve Scroll (Callback)
      </Link>
      <Link
        href="/links/preserve-scroll-page-two"
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

PreserveScroll.layout = (page) => <WithScrollRegion children={page} />

export default PreserveScroll
