<script lang="ts">
  import { InfiniteScroll, Link } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manualAfter={2}>
  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  <div slot="next" let:exposedNext>
    {#if exposedNext.loading}
      <p>Loading...</p>
    {/if}

    <p>Manual mode: {exposedNext.manualMode}</p>

    {#if exposedNext.manualMode}
      <button on:click={exposedNext.fetch}>Load next items...</button>
    {/if}
  </div>
</InfiniteScroll>

<div style="margin-top: 40px; padding: 20px; border-top: 2px solid #ccc">
  <Link href="/home">Go to Home</Link>
</div>
