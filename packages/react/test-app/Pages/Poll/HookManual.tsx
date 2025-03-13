import { usePoll } from '@inertiajs/react'

export default () => {
  const { start, stop } = usePoll(
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
  )

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}
