import { Form } from '@inertiajs/react'

export default ({
  user,
}: {
  user: {
    name: string
  }
}) => {
  return (
    <Form action="/form-component/default-value" method="patch">
      {({ errors }) => (
        <>
          <h1>Form Default Values</h1>

          <div>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" defaultValue={user.name} />
            <div id="error_name">{errors['user.name']}</div>
          </div>

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
