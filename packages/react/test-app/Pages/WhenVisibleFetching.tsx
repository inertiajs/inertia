import { WhenVisible } from '@inertiajs/react'

export default () => {
  return (
    <div style={{ marginTop: '5000px' }}>
      <WhenVisible data="lazyData" always fallback={<div>Loading lazy data...</div>}>
        {({ fetching }) => (
          <>
            <div>Lazy data loaded!</div>
            {fetching && <div>Fetching in background...</div>}
          </>
        )}
      </WhenVisible>
    </div>
  )
}
