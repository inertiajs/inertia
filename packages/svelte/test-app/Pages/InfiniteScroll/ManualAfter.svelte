<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
</script>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manualAfter={2}>
  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  {#snippet next({ loading, manualMode, fetch })}
    <div>
      {#if loading}
        <p>Loading...</p>
      {/if}

      <p>Manual mode: {manualMode}</p>

      {#if manualMode}
        <button onclick={fetch}>Load next items...</button>
      {/if}
    </div>
  {/snippet}
</InfiniteScroll>
