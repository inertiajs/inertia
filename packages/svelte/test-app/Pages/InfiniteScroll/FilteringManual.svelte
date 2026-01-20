<script lang="ts">
  import { InfiniteScroll, useForm } from '@inertiajs/svelte'
  import { onDestroy, untrack } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
    search?: string | undefined
  }

  let { users, search = undefined }: Props = $props()

  // svelte-ignore state_referenced_locally
  const form = useForm({
    search: search,
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined = $state()

  // svelte-ignore state_referenced_locally
  let previousSearch = $state($state.snapshot(search))

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  $effect(() => {
    if (form.search !== previousSearch) {
      untrack(() => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Set new timeout for debounced search
        timeoutId = setTimeout(() => {
          form.get('', {
            preserveState: true,
            replace: true,
            only: ['users', 'search'],
            reset: ['users'],
          })

          previousSearch = form.search
        }, 250)
      })
    }
  })
</script>

<div>
  <div style="margin-bottom: 20px; display: flex; gap: 10px">
    <div>Current search: {search || 'none'}</div>
    <input bind:value={form.search} placeholder="Search..." />
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    {#snippet previous({ hasMore, loading, fetch })}
      <div>
        <p>Has more previous items: {hasMore}</p>
        <button onclick={fetch}>
          {loading ? 'Loading previous items...' : 'Load previous items'}
        </button>
      </div>
    {/snippet}

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}

    {#snippet next({ hasMore, loading, fetch })}
      <div>
        <p>Has more next items: {hasMore}</p>
        <button onclick={fetch}>
          {loading ? 'Loading next items...' : 'Load next items'}
        </button>
      </div>
    {/snippet}
  </InfiniteScroll>
</div>
