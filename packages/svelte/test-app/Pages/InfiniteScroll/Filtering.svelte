<script lang="ts">
  import { InfiniteScroll, Link, useForm } from '@inertiajs/svelte'
  import { onDestroy, untrack } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
    preserveState: boolean
    filter?: string | undefined
    search?: string | undefined
  }

  let { users, preserveState, filter = undefined, search = undefined }: Props = $props()

  // svelte-ignore state_referenced_locally
  const form = useForm({
    filter: undefined,
    page: undefined,
    search: search,
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined = $state()
  // svelte-ignore state_referenced_locally
  let previousSearch = $state(search)

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  // Debounced search using manual setTimeout/clearTimeout
  $effect(() => {
    if (form.search !== previousSearch) {
      untrack(() => {
        // Clear previous timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Set new timeout for debounced search
        timeoutId = setTimeout(() => {
          form.get(
            '',
            preserveState
              ? {
                  preserveState: true,
                  replace: true,
                  only: ['users', 'search', 'filter'],
                  reset: ['users'],
                }
              : { replace: true },
          )

          previousSearch = form.search
        }, 250)
      })
    }
  })
</script>

<div>
  <div style="margin-bottom: 20px; display: flex; gap: 10px">
    <Link href="">No Filter</Link>
    <Link href="?filter=a-m">A-M</Link>
    <Link href="?filter=n-z">N-Z</Link>
    <div>Current filter: {filter || 'none'}</div>
    <div>Current search: {search || 'none'}</div>
    <input bind:value={form.search} placeholder="Search..." />
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    {#snippet loading()}
      <div style="text-align: center; padding: 20px">Loading...</div>
    {/snippet}

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>

  <div style="margin-top: 20px; display: flex; gap: 10px">
    <Link href="">No Filter</Link>
    <Link href="?filter=a-m">A-M</Link>
    <Link href="?filter=n-z">N-Z</Link>
    <div>Current filter: {filter || 'none'}</div>
    <div>Current search: {search || 'none'}</div>
    <input bind:value={form.search} placeholder="Search..." />
  </div>
</div>
