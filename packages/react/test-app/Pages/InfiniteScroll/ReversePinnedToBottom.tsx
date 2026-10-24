import { InfiniteScroll } from '@inertiajs/react'
import { useEffect, useMemo, useRef } from 'react'

export default ({ users }: { users: { data: { id: number; name: string }[] } }) => {
  const reversedUsers = useMemo(() => [...users.data].reverse(), [users.data])
  const container = useRef<HTMLDivElement>(null)

  // Pins the container to its bottom whenever its content changes, the way a chat transcript follows its newest message
  useEffect(() => {
    const element = container.current!
    const observer = new MutationObserver(() => {
      element.scrollTop = element.scrollHeight - element.clientHeight
    })

    observer.observe(element, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div ref={container} data-testid="scroll-container" style={{ flex: 1, overflowY: 'auto' }}>
        <InfiniteScroll data="users" style={{ display: 'grid', gap: '4px', padding: '20px' }} reverse>
          {reversedUsers.map((user) => (
            <div
              key={user.id}
              data-user-id={user.id}
              style={{ height: '20.25px', border: '1px solid #ddd', fontSize: '13px' }}
            >
              {user.name}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  )
}
