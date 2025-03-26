import { router } from '@inertiajs/react'
import { useRef } from 'react'

export default () => {
  const pollRef = useRef(
    router.poll(
      500,
      {
        only: ['custom_prop'],
        onFinish() {
          console.log('hook poll finished')
        },
      },
      {
        autoStart: false,
      },
    ),
  )

  return (
    <>
      <button onClick={pollRef.current.start}>Start</button>
      <button onClick={pollRef.current.stop}>Stop</button>
    </>
  )
}
