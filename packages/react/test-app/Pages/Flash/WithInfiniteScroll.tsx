import { InfiniteScroll, router, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'

export default ({ users }: { users: { data: { id: number; name: string }[] } }) => {
  const page = usePage()
  const [flashEventCount, setFlashEventCount] = useState(0)
  const listenerSetup = useRef(false)

  if (!listenerSetup.current) {
    listenerSetup.current = true
    router.on('flash', () => {
      setFlashEventCount((n) => n + 1)
    })
  }

  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>
      <span id="flash-event-count">{flashEventCount}</span>

      <InfiniteScroll data="users" style={{ display: 'grid', gap: '20px' }}>
        {users.data.map((user) => (
          <div key={user.id} style={{ height: '15vh', border: '1px solid #ccc' }}>
            {user.name}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
