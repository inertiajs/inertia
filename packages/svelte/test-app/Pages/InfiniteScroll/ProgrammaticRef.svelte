<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { onMount } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'
  import type { InfiniteScrollRef } from '@inertiajs/core'
  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  // Use the actual component type like Form component does
  let infRef: InfiniteScrollRef | null = $state(null)
  let hasPrevious = $state(false)
  let hasNext = $state(false)

  function updateStates() {
    hasPrevious = infRef?.hasPrevious() || false
    hasNext = infRef?.hasNext() || false
  }

  function fetchNext() {
    infRef?.fetchNext({ onFinish: updateStates })
  }

  function fetchPrevious() {
    infRef?.fetchPrevious({ onFinish: updateStates })
  }

  onMount(() => setTimeout(updateStates))
</script>

<div>
  <h1>Programmatic Ref Test</h1>

  <div style="margin-bottom: 20px">
    <p>Has more previous items: {hasPrevious.toString()}</p>
    <p>Has more next items: {hasNext.toString()}</p>

    <div style="display: flex; gap: 10px; margin: 10px 0">
      <button onclick={fetchPrevious}>Load Previous (Ref)</button>
      <button onclick={fetchNext}>Load Next (Ref)</button>
    </div>
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual bind:this={infRef}>
    {#snippet loading()}
      <div style="text-align: center; padding: 20px">Loading...</div>
    {/snippet}

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>

  <p>Total items on page: {users.data.length}</p>
</div>
