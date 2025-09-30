import { InfiniteScrollRef } from '@inertiajs/core'
import { InfiniteScroll } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const infRef = useRef<InfiniteScrollRef>(null)
  const [hasPrevious, setHasMoreBefore] = useState(false)
  const [hasNext, setHasMoreAfter] = useState(false)

  const updateStates = () => {
    setHasMoreBefore(infRef.current?.hasPrevious() || false)
    setHasMoreAfter(infRef.current?.hasNext() || false)
  }

  const fetchNext = () => {
    if (infRef.current) {
      infRef.current.fetchNext({ onFinish: updateStates })
    }
  }

  const fetchPrevious = () => {
    if (infRef.current) {
      infRef.current.fetchPrevious({ onFinish: updateStates })
    }
  }

  useEffect(() => {
    updateStates()
  }, [infRef.current])

  return (
    <div>
      <h1>Programmatic Ref Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Has more previous items: {hasPrevious.toString()}</p>
        <p>Has more next items: {hasNext.toString()}</p>

        <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
          <button onClick={fetchPrevious}>Load Previous (Ref)</button>
          <button onClick={fetchNext}>Load Next (Ref)</button>
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
