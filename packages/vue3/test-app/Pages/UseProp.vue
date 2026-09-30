<script setup lang="ts">
import { router, useProp } from '@inertiajs/vue3'

const { value: users, loading: usersLoading, loaded: usersLoaded } = useProp<string>('users')

const { value: stats, loading: statsLoading } = useProp<string>('stats')

const { value: userName, loading: userNameLoading } = useProp<string>('user.name')

const { loading: userEmailLoading } = useProp<string>('user.email')

const { value: orders, loading: ordersLoading, loaded: ordersLoaded } = useProp<string>('orders')

const reloadUsers = () => router.reload({ only: ['users'] })
const reloadUserName = () => router.reload({ only: ['user.name'] })
const reloadEverything = () => router.reload({ data: { delay: 500 } })
const reloadExceptUsers = () => router.reload({ except: ['users'] })
const resetUsers = () => router.reload({ reset: ['users'] })
const cancelUsers = () => router.reload({ only: ['users'], onCancelToken: ({ cancel }) => cancel() })

function reloadUsersTwice() {
  router.reload({ only: ['users'], data: { delay: 300 } })
  router.reload({ only: ['users'], data: { delay: 900 } })
}
</script>

<template>
  <div>
    <h1>useProp</h1>

    <dl>
      <dt>users</dt>
      <dd>
        value: <span id="users-value">{{ users ?? 'none' }}</span
        >, loading: <span id="users-loading">{{ usersLoading }}</span
        >, loaded: <span id="users-loaded">{{ usersLoaded }}</span>
      </dd>

      <dt>stats</dt>
      <dd>
        value: <span id="stats-value">{{ stats ?? 'none' }}</span
        >, loading: <span id="stats-loading">{{ statsLoading }}</span>
      </dd>

      <dt>user.name</dt>
      <dd>
        value: <span id="user-name-value">{{ userName ?? 'none' }}</span
        >, loading: <span id="user-name-loading">{{ userNameLoading }}</span>
      </dd>

      <dt>user.email</dt>
      <dd>
        loading: <span id="user-email-loading">{{ userEmailLoading }}</span>
      </dd>

      <dt>orders</dt>
      <dd>
        value: <span id="orders-value">{{ orders ?? 'none' }}</span
        >, loading: <span id="orders-loading">{{ ordersLoading }}</span
        >, loaded:
        <span id="orders-loaded">{{ ordersLoaded }}</span>
      </dd>
    </dl>

    <button @click="reloadUsers">Reload Users</button>
    <button @click="reloadUserName">Reload User Name</button>
    <button @click="reloadEverything">Reload Everything</button>
    <button @click="reloadExceptUsers">Reload Except Users</button>
    <button @click="resetUsers">Reset Users</button>
    <button @click="reloadUsersTwice">Reload Users Twice</button>
    <button @click="cancelUsers">Cancel Users Immediately</button>
  </div>
</template>
