import { useState } from 'react'
import { Form } from '@inertiajs/react'

export default () => {
  const [transformType, setTransformType] = useState('none')

  const getTransform = () => {
    switch (transformType) {
      case 'uppercase':
        return (data) => ({
          ...data,
          name: data.name?.toUpperCase()
        })
      case 'format':
        return (data) => ({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`
        })
      default:
        return (data) => data
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
          <button type="submit">
            Submit with Transform
          </button>
        </div>
      </Form>
    </div>
  )
}