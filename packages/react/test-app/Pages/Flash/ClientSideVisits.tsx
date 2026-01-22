import { router, usePage } from '@inertiajs/react'

declare global {
  interface Window {
    flashCount: number
  }
}

window.flashCount ??= 0

export default () => {
  const page = usePage()

  const withFlash = () => {
    router.replace({
      flash: { foo: 'bar' },
      onFlash: () => window.flashCount++,
    })
  }

  const withFlashFunction = () => {
    router.replace({
      flash: (flash) => ({ ...flash, bar: 'baz' }),
      onFlash: () => window.flashCount++,
    })
  }

  const withoutFlash = () => {
    router.replace({
      props: (props) => ({ ...props }),
      onFlash: () => window.flashCount++,
    })
  }

  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>

      <button onClick={withFlash}>With flash object</button>
      <button onClick={withFlashFunction}>With flash function</button>
      <button onClick={withoutFlash}>Without flash</button>
    </div>
  )
}
