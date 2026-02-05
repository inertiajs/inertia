import { Form } from '@inertiajs/react'

export default () => {
  return (
    <Form action="/non-inertia/download" method="get">
      <input type="text" name="search" id="search" defaultValue="test-query" />

      <button type="submit" formTarget="_blank" name="format" value="csv" id="button-blank">
        Button with formTarget blank
      </button>
      <input type="submit" formTarget="_blank" name="type" value="export" id="input-blank" />
    </Form>
  )
}
