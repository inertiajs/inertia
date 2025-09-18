<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { onMount } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'
  export let users: { data: User[] }

  // Use the actual component type like Form component does
  let infRef: any = null
  let hasMoreBefore = false
  let hasMoreAfter = false

  function updateStates() {
    hasMoreBefore = infRef?.hasMoreBefore() || false
    hasMoreAfter = infRef?.hasMoreAfter() || false
  }

  function loadNext() {
    if (infRef) {
      infRef.loadAfter({ onFinish: updateStates })
    }
  }

  function loadPrevious() {
    if (infRef) {
      infRef.loadBefore({ onFinish: updateStates })
    }
  }

  onMount(() => setTimeout(updateStates))
</script>

<div>
  <h1>Programmatic Ref Test</h1>

  <div style="margin-bottom: 20px">
    <p>Has more previous items: {hasMoreBefore.toString()}</p>
    <p>Has more next items: {hasMoreAfter.toString()}</p>

    <div style="display: flex; gap: 10px; margin: 10px 0">
      <button on:click={loadPrevious}>Load Previous (Ref)</button>
      <button on:click={loadNext}>Load Next (Ref)</button>
    </div>
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual bind:this={infRef}>
    <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>

  <p>Total items on page: {users.data.length}</p>
</div>
