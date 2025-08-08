import { useState } from 'react'
import { Form } from '@inertiajs/react'

export default () => {
  const [headers, setHeaders] = useState<Record<string, string>>({
    'X-Foo': 'Bar',
  })

  function addCustomHeader() {
    setHeaders((previousHeaders) => ({
      ...previousHeaders,
      'X-Custom': 'MyCustomValue',
    }))
  }

  return (
    <Form action="/dump/post" method="post" headers={headers}>
      <h1>Form Headers</h1>

      <div>
        <button type="button" onClick={addCustomHeader}>Add Custom Header</button>
      </div>

      <button type="submit">Submit</button>
    </Form>
  )
}
