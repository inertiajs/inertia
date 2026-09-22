import { Form } from '@inertiajs/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default () => {
  const [events, setEvents] = useState<string[]>([])
  const [globalEvents, setGlobalEvents] = useState<string[]>([])
  const [flashData, setFlashData] = useState('')
  const [cancelInOnBefore, setCancelInOnBefore] = useState(false)
  const [preventErrorEvents, setPreventErrorEvents] = useState(false)
  const [action, setAction] = useState('/form-component/events/success')

  const [cancelToken, setCancelToken] = useState<{ cancel: () => void } | null>(null)

  function log(eventName: string) {
    setEvents((previousEvents) => [...previousEvents, eventName])
  }

  const formEvents = useMemo(
    () => ({
      onBefore: () => {
        log('onBefore')

        if (cancelInOnBefore) {
          log('onCancel')
          return false
        }
      },
      onStart: () => log('onStart'),
      onProgress: () => log('onProgress'),
      onFinish: () => log('onFinish'),
      onCancel: () => log('onCancel'),
      onSuccess: () => log('onSuccess'),
      onError: () => log('onError'),
      onHttpException: () => {
        log('onHttpException')

        if (preventErrorEvents) {
          return false
        }
      },
      onNetworkError: () => {
        log('onNetworkError')

        if (preventErrorEvents) {
          return false
        }
      },
      onFlash: (flash: Record<string, unknown>) => {
        log('onFlash')
        setFlashData(JSON.stringify(flash))
      },
      onCancelToken: (token: { cancel: () => void }) => {
        log('onCancelToken')
        setCancelToken(token)
      },
    }),
    [cancelInOnBefore, preventErrorEvents],
  )

  const cancelVisit = useCallback(() => {
    if (cancelToken) {
      cancelToken.cancel()
      setCancelToken(null)
    }
  }, [cancelToken])

  useEffect(() => {
    const logGlobalEvent = (name: string) => () => setGlobalEvents((previousEvents) => [...previousEvents, name])

    const onHttpException = logGlobalEvent('httpException')
    const onNetworkError = logGlobalEvent('networkError')

    document.addEventListener('inertia:httpException', onHttpException)
    document.addEventListener('inertia:networkError', onNetworkError)

    return () => {
      document.removeEventListener('inertia:httpException', onHttpException)
      document.removeEventListener('inertia:networkError', onNetworkError)
    }
  }, [])

  return (
    <Form action={action} method="post" {...formEvents}>
      {({ processing, progress, wasSuccessful, recentlySuccessful, cancel }) => (
        <>
          <h1>Form Events & State</h1>

          <div>
            Events: <span id="events">{events.join(',')}</span>
          </div>

          <div>
            Global events: <span id="global-events">{globalEvents.join(',')}</span>
          </div>

          <div>
            Flash: <span id="flash">{flashData}</span>
          </div>

          <div>
            Processing: <span id="processing">{String(processing)}</span>
          </div>

          <div>
            Progress:{' '}
            <span id="progress" className={progress?.percentage ? 'uploading' : undefined}>
              {progress?.percentage || 0}
            </span>
          </div>

          <div>
            Was successful: <span id="was-successful">{String(wasSuccessful)}</span>
          </div>

          <div>
            Recently successful: <span id="recently-successful">{String(recentlySuccessful)}</span>
          </div>

          <div>
            <input type="file" name="avatar" id="avatar" />
          </div>

          <div>
            <button type="button" onClick={() => setCancelInOnBefore(true)}>
              Cancel in onBefore
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/errors')}>
              Fail Request
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/delay')}>
              Should Delay
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/flash')}>
              Return Flash
            </button>
            <button type="button" onClick={() => setAction('/non-inertia')}>
              Trigger HTTP Exception
            </button>
            <button type="button" onClick={() => setAction('/disconnect')}>
              Trigger Network Error
            </button>
            <button type="button" onClick={() => setPreventErrorEvents(true)}>
              Prevent Error Events
            </button>
            <button type="button" onClick={cancelVisit}>
              Cancel Visit
            </button>
            <button type="button" onClick={cancel}>
              Cancel Submission
            </button>
            <button type="submit">Submit</button>
          </div>
        </>
      )}
    </Form>
  )
}
