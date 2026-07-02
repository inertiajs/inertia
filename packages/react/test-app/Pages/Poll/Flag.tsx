import { router, usePoll } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [pollFlag, setPollFlag] = useState('pending')
  const [reloadFlag, setReloadFlag] = useState('pending')

  usePoll(500, {
    onFinish(visit) {
      setPollFlag(String((visit as any).poll === true))
    },
  })

  const reload = () => {
    router.reload({
      onFinish(visit) {
        setReloadFlag(String((visit as any).poll === true))
      },
    })
  }

  return (
    <div>
      <div id="poll-flag">poll: {pollFlag}</div>
      <div id="reload-flag">reload: {reloadFlag}</div>
      <button onClick={reload}>Reload</button>
    </div>
  )
}
