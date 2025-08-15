import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Empty Action Test</h1>

      <Form method="post">
        {({ errors }) => (
          <>
            <div>
              <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
              {errors.name && <p id="error_name">{errors.name}</p>}
            </div>

            <div>
              <button type="submit">Submit</button>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
