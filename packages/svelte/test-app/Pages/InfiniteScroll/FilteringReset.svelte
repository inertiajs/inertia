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

  <InfiniteScroll data="users" buffer={2000} style="display: grid; gap: 20px">
    {#snippet loading()}
      <div style="text-align: center; padding: 20px">Loading...</div>
    {/snippet}

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>
</div>
