import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>OnSubmitComplete Defaults Test</h1>

      <Form method="post" onSubmitComplete={(props) => props.defaults()}>
        {({ errors, isDirty }) => (
          <>
            <div>
              <p id="dirty-status">{isDirty ? 'Form is dirty' : 'Form is clean'}</p>
            </div>

            <div>
              <input type="text" name="name" id="name" placeholder="Name" defaultValue="John Doe" />
              {errors.name && <p id="error_name">{errors.name}</p>}
            </div>

            <div>
              <input type="email" name="email" id="email" placeholder="Email" defaultValue="john@doe.biz" />
              {errors.email && <p id="error_email">{errors.email}</p>}
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
