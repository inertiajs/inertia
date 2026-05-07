import { router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [status, setStatus] = useState('idle')
  const [cancelFired, setCancelFired] = useState(false)
  const [timeoutFired, setTimeoutFired] = useState(false)

  const visit = (timeout: number | string = 300) => {
    setStatus('pending')
    setCancelFired(false)
    setTimeoutFired(false)
    router.visit('/visit/timeout/slow?delay=2000', {
      timeout,
      onTimeout: () => {
        setTimeoutFired(true)
        setStatus('timed-out')
      },
      onCancel: () => setCancelFired(true),
      onSuccess: () => setStatus('success'),
    })
  }

  return (
    <>
      <button id="visit" onClick={() => visit(1500)}>
        Visit
      </button>
      <button id="visit-string" onClick={() => visit('300ms')}>
        Visit (string)
      </button>
      <span id="status">{status}</span>
      <span id="cancel-fired">{cancelFired ? 'yes' : 'no'}</span>
      <span id="timeout-fired">{timeoutFired ? 'yes' : 'no'}</span>
    </>
  )
}
