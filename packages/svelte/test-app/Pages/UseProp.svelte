<script lang="ts">
  import { router, useProp } from '@inertiajs/svelte'

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
</script>

<div>
  <h1>useProp</h1>

  <dl>
    <dt>users</dt>
    <dd>
      value: <span id="users-value">{users.value ?? 'none'}</span>, loading:
      <span id="users-loading">{users.loading}</span>, loaded: <span id="users-loaded">{users.loaded}</span>
    </dd>

    <dt>stats</dt>
    <dd>
      value: <span id="stats-value">{stats.value ?? 'none'}</span>, loading:
      <span id="stats-loading">{stats.loading}</span>
    </dd>

    <dt>user.name</dt>
    <dd>
      value: <span id="user-name-value">{userName.value ?? 'none'}</span>, loading:
      <span id="user-name-loading">{userName.loading}</span>
    </dd>

    <dt>user.email</dt>
    <dd>
      loading: <span id="user-email-loading">{userEmail.loading}</span>
    </dd>

    <dt>orders</dt>
    <dd>
      value: <span id="orders-value">{orders.value ?? 'none'}</span>, loading:
      <span id="orders-loading">{orders.loading}</span>, loaded:
      <span id="orders-loaded">{orders.loaded}</span>
    </dd>
  </dl>

  <button onclick={reloadUsers}>Reload Users</button>
  <button onclick={reloadUserName}>Reload User Name</button>
  <button onclick={reloadEverything}>Reload Everything</button>
  <button onclick={reloadExceptUsers}>Reload Except Users</button>
  <button onclick={resetUsers}>Reset Users</button>
  <button onclick={reloadUsersTwice}>Reload Users Twice</button>
  <button onclick={cancelUsers}>Cancel Users Immediately</button>
</div>
