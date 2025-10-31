<script lang="ts">
  import { InfiniteScroll, router } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
  export let time: number

  const reloadTime = () => {
    router.reload({ only: ['time'] })
  }
</script>

<div>
  <div>
    <button on:click={reloadTime} id="reload-button">Reload Time</button>
    <span id="time-display">Current time: {time}</span>
  </div>

  <InfiniteScroll data="users">
    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>
</div>
