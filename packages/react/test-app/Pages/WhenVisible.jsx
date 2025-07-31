import { WhenVisible } from '@inertiajs/react'
import { useState } from 'react'

const Foo = ({ label }) => {
  return <div>{label}</div>
}

export default () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{ marginTop: '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading first one...</div>}>
          <Foo label="First one is visible!" />
        </WhenVisible>
      </div>

      <div style={{ marginTop: '5000px' }}>
        <WhenVisible buffer={1000} data="foo" fallback={() => <div>Loading second one...</div>}>
          {() => <Foo label="Second one is visible!" />}
        </WhenVisible>
      </div>

      <div style={{ marginTop: '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading third one...</div>} always>
          <Foo label="Third one is visible!" />
        </WhenVisible>
      </div>

      <div style={{ marginTop: '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading fourth one...</div>}></WhenVisible>
      </div>

      <div style={{ marginTop: '6000px' }}>
        <WhenVisible
          fallback={<div>Loading fifth one...</div>}
          always
          params={{
            data: {
              count,
            },
            onSuccess: () => {
              setCount((c) => c + 1)
            },
          }}
        >
          <Foo label={`Count is now ${count}`} />
        </WhenVisible>
      </div>
    </>
  )
}
