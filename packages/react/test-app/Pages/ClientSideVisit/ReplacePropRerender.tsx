import { router } from '@inertiajs/react'
import { memo, useRef } from 'react'

const MemoizedOther = memo(({ other }: { other: { label: string } }) => {
  const renderCount = useRef(0)

  renderCount.current++

  return (
    <div>
      <div id="memo-render-count">Memo render count: {renderCount.current}</div>
      <div id="memo-value">Memo value: {other.label}</div>
    </div>
  )
})

export default ({ user, other }: { user: { name: string }; other: { label: string } }) => {
  return (
    <div>
      <h1>replaceProp Identity Test</h1>
      <div id="current-value">Current value: {user.name}</div>

      <MemoizedOther other={other} />

      <button onClick={() => router.replaceProp('user.name', 'Jane Smith')}>Replace user.name</button>
    </div>
  )
}
