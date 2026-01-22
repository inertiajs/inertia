<script lang="ts">
  import { InfiniteScroll, useForm } from '@inertiajs/svelte'
  import { onDestroy } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }
  export let search: string | undefined = undefined

  const form = useForm({
    search: search,
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let previousSearch = search

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  $: if ($form.search !== previousSearch) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout for debounced search
    timeoutId = setTimeout(() => {
      $form.get('', {
        preserveState: true,
        replace: true,
        only: ['users', 'search'],
        reset: ['users'],
      })
      // eslint-disable-next-line svelte/infinite-reactive-loop
      previousSearch = $form.search
    }, 250)
  }
</script>

<div>
  <div style="margin-bottom: 20px; display: flex; gap: 10px">
    <div>Current search: {search || 'none'}</div>
    <input bind:value={$form.search} placeholder="Search..." />
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    <div slot="previous" let:hasMore let:loading let:fetch>
      <p>Has more previous items: {hasMore}</p>
      <button on:click={fetch}>
        {loading ? 'Loading previous items...' : 'Load previous items'}
      </button>
    </div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}

    <div slot="next" let:hasMore let:loading let:fetch>
      <p>Has more next items: {hasMore}</p>
      <button on:click={fetch}>
        {loading ? 'Loading next items...' : 'Load next items'}
      </button>
    </div>
  </InfiniteScroll>
</div>
