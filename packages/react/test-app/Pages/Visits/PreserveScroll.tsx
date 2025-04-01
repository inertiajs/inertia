import WithScrollRegion from '@/Layouts/WithScrollRegion.jsx'
import { router } from '@inertiajs/react'

const PreserveScroll = ({ foo = 'default' }) => {
  const preserve = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-scroll-page-two', { data: { foo: 'foo' }, preserveScroll: true })
  }

  const preserveFalse = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-scroll-page-two', { data: { foo: 'bar' } })
  }

  const preserveCallback = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-scroll-page-two', {
      data: { foo: 'baz' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))
        return true
      },
    })
  }

  const preserveCallbackFalse = (e) => {
    e.preventDefault()
    router.visit('/visits/preserve-scroll-page-two', {
      data: { foo: 'foo' },
      preserveScroll: (page) => {
        console.log(JSON.stringify(page))
        return false
      },
    })
  }

  const preserveGet = (e) => {
    e.preventDefault()
    router.get(
      '/visits/preserve-scroll-page-two',
      { foo: 'bar' },
      {
        preserveScroll: true,
      },
    )
  }

  const preserveGetFalse = (e) => {
    e.preventDefault()
    router.get('/visits/preserve-scroll-page-two', { foo: 'baz' })
  }

  return (
    <div style={{ height: '800px', width: '600px' }}>
      <span className="text">
        This is the page that demonstrates scroll preservation with scroll regions when using manual visits
      </span>
      <span className="foo">Foo is now {foo}</span>

      <a href="#" onClick={preserve} className="preserve">
        Preserve Scroll
      </a>
      <a href="#" onClick={preserveFalse} data-testid="reset" className="reset">
        Reset Scroll
      </a>
      <a href="#" onClick={preserveCallback} className="preserve-callback">
        Preserve Scroll (Callback)
      </a>
      <br />
      <a href="#" onClick={preserveCallbackFalse} className="reset-callback">
        Reset Scroll (Callback)
      </a>
      <a href="#" onClick={preserveGet} className="preserve-get">
        Preserve Scroll (GET)
      </a>
      <a href="#" onClick={preserveGetFalse} className="reset-get">
        Reset Scroll (GET)
      </a>

      <a href="/non-inertia" className="off-site">
        Off-site link
      </a>
    </div>
  )
}

PreserveScroll.layout = (page) => <WithScrollRegion children={page} />

export default PreserveScroll
