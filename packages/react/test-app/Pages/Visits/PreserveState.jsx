import { router } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ foo = 'default' }) => {
  useEffect(() => {
    window._inertia_page_key = null
  })

  const preserve = () => {
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'bar' }, preserveState: true })
  }

  const preserveFalse = () => {
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'baz' }, preserveState: false })
  }

  const preserveCallback = () => {
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-bar' },
      {
        preserveState: (page) => {
          alert(page)
          return true
        },
      },
    )
  }

  const preserveCallbackFalse = () => {
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-baz' },
      {
        preserveState: (page) => {
          alert(page)
          return false
        },
      },
    )
  }

  const preserveGet = () => {
    router.get('/visits/preserve-state-page-two', { foo: 'get-bar' }, { preserveState: true })
  }

  const preserveGetFalse = () => {
    router.get('/visits/preserve-state-page-two', { foo: 'get-baz' }, { preserveState: false })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates preserve state on manual visits</span>
      <span className="foo">Foo is now {foo}</span>
      <label>
        Example Field
        <input type="text" name="example-field" className="field" />
      </label>

      <span onClick={preserve} className="preserve">
        [State] Preserve visit: true
      </span>
      <span onClick={preserveFalse} className="preserve-false">
        [State] Preserve visit: false
      </span>
      <span onClick={preserveCallback} className="preserve-callback">
        [State] Preserve Callback: true
      </span>
      <span onClick={preserveCallbackFalse} className="preserve-callback-false">
        [State] Preserve Callback: false
      </span>
      <span onClick={preserveGet} className="preserve-get">
        [State] Preserve GET: true
      </span>
      <span onClick={preserveGetFalse} className="preserve-get-false">
        [State] Preserve GET: false
      </span>
    </div>
  )
}
