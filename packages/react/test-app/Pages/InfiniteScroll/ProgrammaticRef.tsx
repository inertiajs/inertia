import { InfiniteScrollRef } from '@inertiajs/core'
import { InfiniteScroll } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const infRef = useRef<InfiniteScrollRef>(null)
  const [hasMoreBefore, setHasMoreBefore] = useState(false)
  const [hasMoreAfter, setHasMoreAfter] = useState(false)

  const updateStates = () => {
    setHasMoreBefore(infRef.current?.hasMoreBefore() || false)
    setHasMoreAfter(infRef.current?.hasMoreAfter() || false)
  }

  const loadNext = () => {
    if (infRef.current) {
      infRef.current.loadAfter({ onFinish: updateStates })
    }
  }

  const loadPrevious = () => {
    if (infRef.current) {
      infRef.current.loadBefore({ onFinish: updateStates })
    }
  }

  useEffect(() => {
    updateStates()
  }, [infRef.current])

  return (
    <div>
      <h1>Programmatic Ref Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Has more previous items: {hasMoreBefore.toString()}</p>
        <p>Has more next items: {hasMoreAfter.toString()}</p>

        <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
          <button onClick={loadPrevious}>Load Previous (Ref)</button>
          <button onClick={loadNext}>Load Next (Ref)</button>
        </div>
      </div>

      <InfiniteScroll
        ref={infRef}
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>

      <p>Total items on page: {users.data.length}</p>
    </div>
  )
}
