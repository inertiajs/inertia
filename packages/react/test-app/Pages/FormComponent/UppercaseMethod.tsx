import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Uppercase Method Test</h1>

      {/* Test with uppercase POST */}
      <Form action="/dump/post" method="POST">
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="Test POST" />
        </div>
        <button type="submit">Submit POST</button>
      </Form>

      {/* Test with uppercase GET */}
      <Form action="/dump/get" method="GET">
        <div>
          <input type="text" name="query" placeholder="Query" defaultValue="Test GET" />
        </div>
        <button type="submit">Submit GET</button>
      </Form>

      {/* Test with uppercase PUT */}
      <Form action="/dump/put" method="PUT">
        <div>
          <input type="text" name="data" placeholder="Data" defaultValue="Test PUT" />
        </div>
        <button type="submit">Submit PUT</button>
      </Form>
    </div>
  )
}