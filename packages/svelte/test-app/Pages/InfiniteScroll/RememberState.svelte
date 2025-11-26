<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { InfiniteScroll, Link, router } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  function prependUser(id: number) {
    router.prependToProp('users.data', { id, name: `User ${id}` })
  }
</script>

<div style="margin-bottom: 40px; padding: 20px; border-top: 2px solid #ccc">
  <div style="margin-bottom: 20px">
    <button onclick={() => prependUser(0)} style="margin-right: 10px">Prepend User '0'</button>
    <button onclick={() => prependUser(-1)} style="margin-right: 10px">Prepend User '-1'</button>
  </div>
  <Link href="/home">Go Home</Link>
</div>

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
        <button onclick={preventDefault(fetch)}>Load next items...</button>
      {/if}
    </div>
  {/snippet}
</InfiniteScroll>

<div style="margin-top: 40px; padding: 20px; border-top: 2px solid #ccc">
  <Link href="/home">Go to Home</Link>
</div>
