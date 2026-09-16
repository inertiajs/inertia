import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [events, setEvents] = useState<string[]>([])
  const [cancelErrors, setCancelErrors] = useState(true)

  function log(event: string) {
    setEvents((previous) => [...previous, event])
  }

  return (
    <Form
      action="/form-component/callbacks"
      method="post"
      onBeforeUpdate={(page) => log(`onBeforeUpdate:${page.component}`)}
      onHttpException={(response) => {
        log(`onHttpException:${response.status}`)
        return cancelErrors ? false : undefined
      }}
      onNetworkError={(error) => {
        log(`onNetworkError:${error instanceof Error}`)
        return cancelErrors ? false : undefined
      }}
      onFlash={(flash) => log(`onFlash:${JSON.stringify(flash)}`)}
      onSuccess={() => log('onSuccess')}
      onError={() => log('onError')}
      onFinish={() => log('onFinish')}
    >
      {({ processing }) => (
        <>
          <label>
            <input type="checkbox" checked={cancelErrors} onChange={(event) => setCancelErrors(event.target.checked)} />
            Cancel errors
          </label>
          <pre id="events">{events.join('\n')}</pre>
          <span id="processing">{String(processing)}</span>
          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
