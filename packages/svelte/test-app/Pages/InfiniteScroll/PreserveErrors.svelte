<script lang="ts">
  import { InfiniteScroll, useForm, page } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/infinite-scroll/preserve-errors')
  }
</script>

{#if page.props.errors?.name}
  <p id="page-error">{page.props.errors.name}</p>
{/if}
{#if form.errors.name}
  <p id="form-error">{form.errors.name}</p>
{/if}

<button type="button" onclick={submit}>Submit</button>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
  {#snippet previous({ hasMore, loading, fetch })}
    {#if hasMore}
      <button id="load-previous" onclick={fetch}>
        {loading ? 'Loading previous items...' : 'Load previous items'}
      </button>
    {/if}
  {/snippet}

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  {#snippet next({ hasMore, loading, fetch })}
    {#if hasMore}
      <button id="load-next" onclick={fetch}>
        {loading ? 'Loading next items...' : 'Load next items'}
      </button>
    {/if}
  {/snippet}
</InfiniteScroll>
