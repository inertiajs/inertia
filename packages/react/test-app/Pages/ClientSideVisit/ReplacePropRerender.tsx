import { router } from '@inertiajs/react'
import { memo, useRef } from 'react'

const MemoChild = memo(({ prefix, item }: { prefix: string; item: { label: string } }) => {
  const renderCount = useRef(0)

  renderCount.current++

  return (
    <div>
      <div id={`${prefix}-render-count`}>Render count: {renderCount.current}</div>
      <div id={`${prefix}-value`}>Value: {item.label}</div>
    </div>
  )
})

export default ({
  user,
  other,
  profile,
}: {
  user: { name: string }
  other: { label: string }
  profile: { name: string; avatar: { label: string } }
}) => {
  return (
    <div>
      <h1>replaceProp Identity Test</h1>
      <div id="current-value">Current value: {user.name}</div>
      <div id="profile-name">Profile name: {profile.name}</div>

      <MemoChild prefix="memo" item={other} />
      <MemoChild prefix="avatar" item={profile.avatar} />

      <button onClick={() => router.replaceProp('user.name', 'Jane Smith')}>Replace user.name</button>
      <button onClick={() => router.replaceProp('profile.name', 'Jane Smith')}>Replace profile.name</button>
    </div>
  )
}
