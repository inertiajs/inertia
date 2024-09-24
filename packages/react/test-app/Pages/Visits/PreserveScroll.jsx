import WithScrollRegion from '@/Layouts/WithScrollRegion.jsx'
import { router } from '@inertiajs/react'

const PreserveScroll = ({ foo = 'default' }) => {
  const preserve = () => {
    router.visit('/visits/preserve-scroll-page-two', { data: { foo: 'foo' }, preserveScroll: true })
  }

  const preserveFalse = () => {
    router.visit('/visits/preserve-scroll-page-two', { data: { foo: 'bar' } })
  }

  const preserveCallback = () => {
    router.visit('/visits/preserve-scroll-page-two', {
      data: { foo: 'baz' },
      preserveScroll: (page) => {
        alert(page)
        return true
      },
    })
  }

  const preserveCallbackFalse = () => {
    router.visit('/visits/preserve-scroll-page-two', {
      data: { foo: 'foo' },
      preserveScroll: (page) => {
        alert(page)
        return false
      },
    })
  }

  const preserveGet = () => {
    router.get(
      '/visits/preserve-scroll-page-two',
      { foo: 'bar' },
      {
        preserveScroll: true,
      },
    )
  }

  const preserveGetFalse = () => {
    router.get('/visits/preserve-scroll-page-two', { foo: 'baz' })
  }

  return (
    <div style={{ height: '800px', width: '600px' }}>
      <span className="text">
        This is the page that demonstrates scroll preservation with scroll regions when using manual visits
      </span>
      <span className="foo">Foo is now {foo}</span>

      <span onClick={preserve} className="preserve">
        Preserve Scroll
      </span>
      <span onClick={preserveFalse} className="reset">
        Reset Scroll
      </span>
      <span onClick={preserveCallback} className="preserve-callback">
        Preserve Scroll (Callback)
      </span>
      <span onClick={preserveCallbackFalse} className="reset-callback">
        Reset Scroll (Callback)
      </span>
      <span onClick={preserveGet} className="preserve-get">
        Preserve Scroll (GET)
      </span>
      <span onClick={preserveGetFalse} className="reset-get">
        Reset Scroll (GET)
      </span>

      <a href="/non-inertia" className="off-site">
        Off-site link
      </a>
    </div>
  )
}

PreserveScroll.layout = (page) => <WithScrollRegion children={page} />

export default PreserveScroll
