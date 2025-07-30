import WithoutScrollRegion from '@/Layouts/WithoutScrollRegion.jsx'
import { Link } from '@inertiajs/react'
import { useId } from 'react'
import type { Page } from '@inertiajs/core'

const PreserveState = ({ foo = 'default' }: { foo?: string }) => {
  const preserveCallback = (page: Page) => {
    alert(page)
    return true
  }

  const preserveCallbackFalse = (page: Page) => {
    alert(page)
    return false
  }

  window._inertia_page_key = useId()

  return (
    <div>
      <span className="text">This is the links page that demonstrates preserve state on Links</span>
      <span className="foo">Foo is now {foo}</span>
      <label>
        Example Field
        <input type="text" name="example-field" className="field" />
      </label>

      <Link href="/links/preserve-state-page-two" preserveState data={{ foo: 'bar' }} className="preserve">
        [State] Preserve: true
      </Link>
      <Link
        href="/links/preserve-state-page-two"
        preserveState={false}
        data={{ foo: 'baz' }}
        className="preserve-false"
      >
        [State] Preserve: false
      </Link>

      <Link
        href="/links/preserve-state-page-two"
        preserveState={preserveCallback}
        data={{ foo: 'callback-bar' }}
        className="preserve-callback"
      >
        [State] Preserve Callback: true
      </Link>
      <Link
        href="/links/preserve-state-page-two"
        preserveState={preserveCallbackFalse}
        data={{ foo: 'callback-baz' }}
        className="preserve-callback-false"
      >
        [State] Preserve Callback: false
      </Link>
    </div>
  )
}

PreserveState.layout = (page: React.ReactNode) => <WithoutScrollRegion children={page} />

export default PreserveState
