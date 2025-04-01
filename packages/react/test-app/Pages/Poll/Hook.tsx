import { Link, usePoll } from '@inertiajs/react'

export default () => {
  usePoll(500, {
    only: ['custom_prop'],
    onFinish() {
      console.log('hook poll finished')
    },
  })

  return <Link href="/">Home</Link>
}
