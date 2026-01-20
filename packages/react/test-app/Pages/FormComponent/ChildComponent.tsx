import { Form } from '@inertiajs/react'
import { useMemo, useState } from 'react'

const ChildElement = ({ name }: { name: string }) => {
  const [internalState, setInternalState] = useState('')
  const transformedState = useMemo(() => internalState.toUpperCase(), [internalState])

  return (
    <div>
      <label htmlFor={name}>Child Input</label>
      <input id={name} name={name} value={transformedState} onChange={(e) => setInternalState(e.target.value)} />
    </div>
  )
}

export default () => {
  return (
    <Form action="/dump/post" method="post">
      {({ isDirty }) => (
        <>
          <h1>Form Elements</h1>

          <div>
            Form is <span>{isDirty ? 'dirty' : 'clean'}</span>
          </div>

          <ChildElement name="child" />

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
