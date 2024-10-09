import { WhenVisible } from '@inertiajs/react'

const Foo = ({ label }) => {
  return <div>{label}</div>
}

export default () => (
  <>
    <div style={{ marginTop: '5000px' }}>
      <WhenVisible data="foo" fallback={<div>Loading first one...</div>}>
        <Foo label="First one is visible!" />
      </WhenVisible>
    </div>

    <div style={{ marginTop: '5000px' }}>
      <WhenVisible buffer={1000} data="foo" fallback={<div>Loading second one...</div>}>
        <Foo label="Second one is visible!" />
      </WhenVisible>
    </div>

    <div style={{ marginTop: '5000px' }}>
      <WhenVisible data="foo" fallback={<div>Loading third one...</div>} always>
        <Foo label="Third one is visible!" />
      </WhenVisible>
    </div>
  </>
)
