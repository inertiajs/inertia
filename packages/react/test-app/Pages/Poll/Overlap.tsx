import { usePoll } from '@inertiajs/react'

export default ({ mode, time }: { mode: string; time: number }) => {
  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  const options: { mode?: 'overlap' | 'cancel' | 'rest'; keepAlive?: boolean } = {}

  if (mode === 'overlap' || mode === 'cancel' || mode === 'rest') {
    options.mode = mode
  }

  if (params.get('keepAlive') === '1') {
    options.keepAlive = true
  }

  const { start, stop } = usePoll(interval, {}, options)

  return (
    <div>
      <span id="mode">{mode}</span>
      <span id="time">{time}</span>
      <button onClick={stop}>Stop</button>
      <button onClick={start}>Start</button>
    </div>
  )
}
