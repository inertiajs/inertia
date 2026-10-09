import { InfiniteScroll, router } from '@inertiajs/react'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const [show, setShow] = useState(true)
  const [items, setItems] = useState<User[]>(users.data)

  const addUser = () => flushSync(() => setItems((current) => [...current, { id: 1000, name: 'Added User' }]))

  const addUserAndUnmount = () => {
    addUser()
    setTimeout(() => setShow(false))
  }

  const addUserAndVisitHome = () => {
    addUser()
    router.visit('/')
  }

  return (
    <div>
      <button onClick={addUserAndUnmount}>Add User and Unmount</button>
      <button onClick={addUserAndVisitHome}>Add User and Visit Home</button>
      <p id="status">Mounted: {String(show)}</p>

      {show && (
        <InfiniteScroll data="users" style={{ display: 'grid', gap: '20px' }}>
          {items.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  )
}
