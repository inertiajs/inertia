import { usePoll } from '@inertiajs/react'

export default ({ mode, time }: { mode: string; time: number }) => {
  const params = new URLSearchParams(window.location.search)
  const interval = parseInt(params.get('interval') || '200')

  const pathMode = window.location.pathname.split('/').pop()

  const options: { mode?: 'overlap' | 'cancel' | 'rest' } = {}

  if (pathMode === 'overlap' || pathMode === 'cancel' || pathMode === 'rest') {
    options.mode = pathMode
  }

  usePoll(interval, {}, options)

  return (
    <div>
      <span id="mode">{mode}</span>
      <span id="time">{time}</span>
    </div>
  )
}
