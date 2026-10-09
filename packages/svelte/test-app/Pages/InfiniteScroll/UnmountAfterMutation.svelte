<script lang="ts">
  import { InfiniteScroll, router } from '@inertiajs/svelte'
  import { tick } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
  let show = $state(true)
  let items = $state<User[]>([...users.data])

  async function addUserAndUnmount() {
    items.push({ id: 1000, name: 'Added User' })
    await tick()
    show = false
  }

  async function addUserAndVisitHome() {
    items.push({ id: 1000, name: 'Added User' })
    await tick()
    router.visit('/')
  }
</script>

<div>
  <button onclick={addUserAndUnmount}>Add User and Unmount</button>
  <button onclick={addUserAndVisitHome}>Add User and Visit Home</button>
  <p id="status">Mounted: {show}</p>

  {#if show}
    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      {#each items as user (user.id)}
        <UserCard {user} />
      {/each}
    </InfiniteScroll>
  {/if}
</div>
