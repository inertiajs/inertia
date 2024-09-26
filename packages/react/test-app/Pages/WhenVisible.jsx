import { Suspense } from 'react'

const Foo = ({ label, once }) => {
  const { foo } = useWhenVisible('foo')

  return <div>{label}</div>
}

export default () => (
  <>
    <div style="margin-top: 5000px">
      <Suspense fallback={<div>Loading first one...</div>}>
        <Foo label="First one is visible!" />
      </Suspense>
    </div>

    <div style="margin-top: 5000px">
      <Suspense fallback={<div>Loading second one...</div>}>
        <Foo label="Second one is visible!" />
      </Suspense>
    </div>

    <div style="margin-top: 5000px">
      <Suspense fallback={<div>Loading third one...</div>}>
        <Foo label="Third one is visible!" once={false} />
      </Suspense>
    </div>
  </>
)
