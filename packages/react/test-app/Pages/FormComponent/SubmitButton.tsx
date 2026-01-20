import { Form } from '@inertiajs/react'

export default () => {
  return (
    <Form action="/dump/post" method="post">
      <h1>Submit Button Test</h1>

      <input type="text" name="name" id="name" defaultValue="John Doe" />

      <button type="submit" name="action" value="save" id="save-button">
        Save
      </button>
      <button type="submit" name="action" value="draft" id="draft-button">
        Save as Draft
      </button>
      <button type="submit" id="no-name-button">
        Submit Without Name
      </button>
    </Form>
  )
}
