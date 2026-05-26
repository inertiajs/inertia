import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Async OnSuccess Test</h1>

      <Form
        method="post"
        action="/form-component/async-on-success/submit"
        disableWhileProcessing
        onSuccess={() => new Promise<void>((resolve) => setTimeout(resolve, 1500))}
      >
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
        </div>

        <div>
          <button type="submit">Submit</button>
        </div>
      </Form>
    </div>
  )
}
