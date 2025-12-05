import { usePage } from '@inertiajs/react'

export default () => {
  const page = usePage()

  return (
    <div>
      <span id="flash">{page.flash ? JSON.stringify(page.flash) : 'no-flash'}</span>
    </div>
  )
}
