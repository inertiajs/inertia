import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Set Defaults On Success Test</h1>

      <Form method="post" action="/form-component/set-defaults-on-success" setDefaultsOnSuccess>
        {({ errors, isDirty }) => (
          <>
            <p id="dirty-status">{isDirty ? 'Form is dirty' : 'Form is clean'}</p>

            <div>
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" defaultValue="John Doe" />
              {errors.name && <p id="error_name">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" defaultValue="john@doe.biz" />
              {errors.email && <p id="error_email">{errors.email}</p>}
            </div>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
