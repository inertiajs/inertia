import { router, usePage } from '@inertiajs/react'

export default () => {
  const page = usePage()

  const setFlash = () => {
    router.flash({ foo: 'bar' })
  }

  const setFlashKeyValue = () => {
    router.flash('foo', 'bar')
  }

  const mergeFlash = () => {
    router.flash((current) => ({ ...current, bar: 'baz' }))
  }

  const clearFlash = () => {
    router.flash(() => ({}))
  }

  return (
    <div>
      <span id="flash">{page.flash ? JSON.stringify(page.flash) : 'no-flash'}</span>

      <button onClick={setFlash}>Set flash</button>
      <button onClick={setFlashKeyValue}>Set flash key-value</button>
      <button onClick={mergeFlash}>Merge flash</button>
      <button onClick={clearFlash}>Clear flash</button>
    </div>
  )
}
