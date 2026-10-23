import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Submit On Enter</h1>

      <Form action="/dump/post" method="post">
        {({ submit }) => (
          <textarea
            name="message"
            id="message"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />
        )}
      </Form>
    </div>
  )
}
