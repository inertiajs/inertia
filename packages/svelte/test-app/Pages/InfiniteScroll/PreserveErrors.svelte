<script lang="ts">
  import { InfiniteScroll, useForm, page } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }

  const form = useForm({ name: '' })

  function submit() {
    $form.post('/infinite-scroll/preserve-errors')
  }
</script>

{#if $page.props.errors?.name}
  <p id="page-error">{$page.props.errors.name}</p>
{/if}
{#if $form.errors.name}
  <p id="form-error">{$form.errors.name}</p>
{/if}

<button type="button" on:click={submit}>Submit</button>

<InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
  <div slot="previous" let:hasMore let:loading let:fetch>
    {#if hasMore}
      <button id="load-previous" on:click={fetch}>
        {loading ? 'Loading previous items...' : 'Load previous items'}
      </button>
    {/if}
  </div>

  {#each users.data as user (user.id)}
    <UserCard {user} />
  {/each}

  <div slot="next" let:hasMore let:loading let:fetch>
    {#if hasMore}
      <button id="load-next" on:click={fetch}>
        {loading ? 'Loading next items...' : 'Load next items'}
      </button>
    {/if}
  </div>
</InfiniteScroll>
