<script lang="ts">
  import { InfiniteScroll, router } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
    time: number
  }

  let { users, time }: Props = $props()

  const reloadTime = () => {
    router.reload({ only: ['time'] })
  }
</script>

<div>
  <div>
    <button onclick={reloadTime} id="reload-button">Reload Time</button>
    <span id="time-display">Current time: {time}</span>
  </div>

  <InfiniteScroll data="users">
    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>
</div>
