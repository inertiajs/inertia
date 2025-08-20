import type { Method } from '@inertiajs/core'
import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [method, setMethod] = useState<Method>('get')

  return (
    <div>
      <h1>HTTP Methods</h1>

      <div>
        <button onClick={() => setMethod('get')}>GET</button>
        <button onClick={() => setMethod('post')}>POST</button>
        <button onClick={() => setMethod('put')}>PUT</button>
        <button onClick={() => setMethod('patch')}>PATCH</button>
        <button onClick={() => setMethod('delete')}>DELETE</button>
      </div>

      <div>Current method: {method}</div>

      <Form action={`/dump/${method}`} method={method}>
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
        </div>

        <div>
          <input type="checkbox" name="active" value="true" defaultChecked />
          <label>Active</label>
        </div>

        <div>
          <button type="submit">Submit {method.toUpperCase()}</button>
        </div>
      </Form>
    </div>
  )
}
