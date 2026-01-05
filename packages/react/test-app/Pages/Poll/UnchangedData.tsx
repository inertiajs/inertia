import { usePoll } from '@inertiajs/react'

export default () => {
  usePoll(500, {
    only: ['custom_prop'],
  })

  return <div />
}
