import { InfiniteScroll, router } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users, time }: { users: { data: User[] }; time: number }) => {
  const reloadTime = () => {
    router.reload({ only: ['time'] })
  }

  return (
    <div>
      <div>
        <button onClick={reloadTime} id="reload-button">
          Reload Time
        </button>
        <span id="time-display"> Current time: {time}</span>
      </div>

      <InfiniteScroll data="users">
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
