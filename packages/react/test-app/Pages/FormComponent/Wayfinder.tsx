import { Form } from '@inertiajs/react'

export default () => {
  const wayfinderUrl = (): {
    url: string
    method: 'post'
  } => ({
    url: '/dump/post',
    method: 'post',
  })

  return (
    <div>
      <h1>Wayfinder Example</h1>

      <Form action={wayfinderUrl()}>
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
        </div>

        <div>
          <input type="checkbox" name="active" value="true" defaultChecked />
          <label>Active</label>
        </div>

        <div>
          <button type="submit">Submit</button>
        </div>
      </Form>
    </div>
  )
}