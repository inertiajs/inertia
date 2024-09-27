import { router } from '@inertiajs/react'
import { useId } from 'react'

export default ({ foo = 'default' }) => {
  window._inertia_page_key = useId()

  const preserve = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'bar' }, preserveState: true })
  }

  const preserveFalse = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'baz' }, preserveState: false })
  }

  const preserveCallback = (e) => {
    e.preventDefault()
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-bar' },
      {
        preserveState: (page) => {
          console.log(JSON.stringify(page))
          return true
        },
      },
    )
  }

  const preserveCallbackFalse = (e) => {
    e.preventDefault()
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-baz' },
      {
        preserveState: (page) => {
          console.log(JSON.stringify(page))
          return false
        },
      },
    )
  }

  const preserveGet = (e) => {
    e.preventDefault()
    router.get('/visits/preserve-state-page-two', { foo: 'get-bar' }, { preserveState: true })
  }

  const preserveGetFalse = (e) => {
    e.preventDefault()
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

      <a href="#" onClick={preserve} className="preserve">
        [State] Preserve visit: true
      </a>
      <a href="#" onClick={preserveFalse} className="preserve-false">
        [State] Preserve visit: false
      </a>
      <a href="#" onClick={preserveCallback} className="preserve-callback">
        [State] Preserve Callback: true
      </a>
      <a href="#" onClick={preserveCallbackFalse} className="preserve-callback-false">
        [State] Preserve Callback: false
      </a>
      <a href="#" onClick={preserveGet} className="preserve-get">
        [State] Preserve GET: true
      </a>
      <a href="#" onClick={preserveGetFalse} className="preserve-get-false">
        [State] Preserve GET: false
      </a>
    </div>
  )
}
