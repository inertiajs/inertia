import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default ({ cancelOnUnmount }: { cancelOnUnmount: boolean }) => {
  const [events, setEvents] = useState<string[]>([])
  const [showModal, setShowModal] = useState(true)
  const [closeOnSuccess, setCloseOnSuccess] = useState(false)

  function log(eventName: string) {
    setEvents((previousEvents) => [...previousEvents, eventName])
  }

  const formEvents = {
    onBefore: () => log('onBefore'),
    onStart: () => log('onStart'),
    onFinish: () => log('onFinish'),
    onCancel: () => log('onCancel'),
    onCancelToken: () => log('onCancelToken'),
    onSuccess: async () => {
      log('onSuccess')

      if (closeOnSuccess) {
        setShowModal(false)

        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    },
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
      <button type="button" onClick={() => setCloseOnSuccess(true)}>
        Close On Success
      </button>
    </div>
  )
}
