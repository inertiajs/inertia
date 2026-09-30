import { router, useProp } from '@inertiajs/react'

export default () => {
  const users = useProp<string>('users')
  const stats = useProp<string>('stats')
  const userName = useProp<string>('user.name')
  const userEmail = useProp<string>('user.email')
  const orders = useProp<string>('orders')

  const reloadUsers = () => router.reload({ only: ['users'] })
  const reloadUserName = () => router.reload({ only: ['user.name'] })
  const reloadEverything = () => router.reload({ data: { delay: 500 } })
  const reloadExceptUsers = () => router.reload({ except: ['users'] })
  const resetUsers = () => router.reload({ reset: ['users'] })
  const cancelUsers = () => router.reload({ only: ['users'], onCancelToken: ({ cancel }) => cancel() })

  const reloadUsersTwice = () => {
    router.reload({ only: ['users'], data: { delay: 300 } })
    router.reload({ only: ['users'], data: { delay: 900 } })
  }

  return (
    <div>
      <h1>useProp</h1>

      <dl>
        <dt>users</dt>
        <dd>
          value: <span id="users-value">{users.value ?? 'none'}</span>, loading:{' '}
          <span id="users-loading">{String(users.loading)}</span>, loaded:{' '}
          <span id="users-loaded">{String(users.loaded)}</span>
        </dd>

        <dt>stats</dt>
        <dd>
          value: <span id="stats-value">{stats.value ?? 'none'}</span>, loading:{' '}
          <span id="stats-loading">{String(stats.loading)}</span>
        </dd>

        <dt>user.name</dt>
        <dd>
          value: <span id="user-name-value">{userName.value ?? 'none'}</span>, loading:{' '}
          <span id="user-name-loading">{String(userName.loading)}</span>
        </dd>

        <dt>user.email</dt>
        <dd>
          loading: <span id="user-email-loading">{String(userEmail.loading)}</span>
        </dd>

        <dt>orders</dt>
        <dd>
          value: <span id="orders-value">{orders.value ?? 'none'}</span>, loading:{' '}
          <span id="orders-loading">{String(orders.loading)}</span>, loaded:{' '}
          <span id="orders-loaded">{String(orders.loaded)}</span>
        </dd>
      </dl>

      <button onClick={reloadUsers}>Reload Users</button>
      <button onClick={reloadUserName}>Reload User Name</button>
      <button onClick={reloadEverything}>Reload Everything</button>
      <button onClick={reloadExceptUsers}>Reload Except Users</button>
      <button onClick={resetUsers}>Reset Users</button>
      <button onClick={reloadUsersTwice}>Reload Users Twice</button>
      <button onClick={cancelUsers}>Cancel Users Immediately</button>
    </div>
  )
}
