import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default ({ cancelOnUnmount }: { cancelOnUnmount: boolean }) => {
  const [events, setEvents] = useState<string[]>([])
  const [showModal, setShowModal] = useState(true)

  function log(eventName: string) {
    setEvents((previousEvents) => [...previousEvents, eventName])
  }

  const formEvents = {
    onBefore: () => log('onBefore'),
    onStart: () => log('onStart'),
    onFinish: () => log('onFinish'),
    onCancel: () => log('onCancel'),
    onSuccess: () => log('onSuccess'),
    onCancelToken: () => log('onCancelToken'),
  }

  return (
    <div>
      <h1>Form Unmount Cancel</h1>

      <div>
        Events: <span id="events">{events.join(',')}</span>
      </div>

      {showModal && (
        <Form
          action={`/form-component/unmount-cancel/${cancelOnUnmount ? 'yes' : 'no'}`}
          method="post"
          cancelOnUnmount={cancelOnUnmount}
          {...formEvents}
        >
          <input type="text" name="name" defaultValue="John" />

          <button type="submit">Submit</button>
        </Form>
      )}

      <button type="button" onClick={() => setShowModal(false)}>
        Close Modal
      </button>
    </div>
  )
}
