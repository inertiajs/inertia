import { Form } from '@inertiajs/react'
import { useCallback, useMemo, useState } from 'react'

export default () => {
  const [events, setEvents] = useState<string[]>([])
  const [cancelInOnBefore, setCancelInOnBefore] = useState(false)
  const [shouldFail, setShouldFail] = useState(false)
  const [shouldDelay, setShouldDelay] = useState(false)

  const [cancelToken, setCancelToken] = useState<{ cancel: () => void } | null>(null)

  function log(eventName: string) {
    setEvents((previousEvents) => [...previousEvents, eventName])
  }

  const action = useMemo(() => {
    if (shouldFail) {
      return '/form-component/events/errors'
    }

    if (shouldDelay) {
      return '/form-component/events/delay'
    }

    return '/form-component/events/success'
  }, [shouldFail, shouldDelay])

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
      onCancelToken: (token: { cancel: () => void }) => {
        log('onCancelToken')
        setCancelToken(token)
      },
    }),
    [cancelInOnBefore],
  )

  const cancelVisit = useCallback(() => {
    if (cancelToken) {
      cancelToken.cancel()
      setCancelToken(null)
    }
  }, [cancelToken])

  return (
    <Form action={action} method="post" {...formEvents}>
      {({ processing, progress, wasSuccessful, recentlySuccessful }) => (
        <>
          <h1>Form Events & State</h1>

          <div>
            Events: <span id="events">{events.join(',')}</span>
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
            <button type="button" onClick={() => setShouldFail(true)}>
              Fail Request
            </button>
            <button type="button" onClick={() => setShouldDelay(true)}>
              Should Delay
            </button>
            <button type="button" onClick={cancelVisit}>
              Cancel Visit
            </button>
            <button type="submit">Submit</button>
          </div>
        </>
      )}
    </Form>
  )
}
