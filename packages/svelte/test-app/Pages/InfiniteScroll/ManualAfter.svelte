<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manualAfter={2}>
  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  <div slot="after" let:exposedAfter>
    {#if exposedAfter.loading}
      <p>Loading...</p>
    {/if}

    <p>Manual mode: {exposedAfter.manualMode}</p>

    {#if exposedAfter.manualMode}
      <button on:click={exposedAfter.fetch}>Load next items...</button>
    {/if}
  </div>
</InfiniteScroll>
