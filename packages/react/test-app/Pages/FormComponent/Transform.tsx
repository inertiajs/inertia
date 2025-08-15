import type { FormDataConvertible } from '@inertiajs/core'
import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [transformType, setTransformType] = useState('none')

  const getTransform = () => {
    switch (transformType) {
      case 'uppercase':
        return (data: Record<string, FormDataConvertible>) => ({
          ...data,
          name: typeof data.name === 'string' ? data.name.toUpperCase() : data.name,
        })
      case 'format':
        return (data: Record<string, FormDataConvertible>) => ({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`,
        })
      default:
        return (data: Record<string, FormDataConvertible>) => data
    }
  }

  return (
    <div>
      <h1>Transform Function</h1>

      <div>
        <button onClick={() => setTransformType('none')}>None</button>
        <button onClick={() => setTransformType('uppercase')}>Uppercase</button>
        <button onClick={() => setTransformType('format')}>Format</button>
      </div>

      <div>Current transform: {transformType}</div>

      <Form action="/dump/post" method="post" transform={getTransform()}>
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
        </div>

        <div>
          <input type="text" name="firstName" placeholder="First Name" defaultValue="John" />
        </div>

        <div>
          <input type="text" name="lastName" placeholder="Last Name" defaultValue="Doe" />
        </div>

        <div>
          <button type="submit">Submit with Transform</button>
        </div>
      </Form>
    </div>
  )
}
