<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  let manual = $state(false)
  let preserveUrl = $state(false)
  let triggerMode: 'onlyPrevious' | 'onlyNext' | 'both' = $state('onlyNext')
</script>

<div>
  <div style="display: flex; gap: 10px">
    <p>
      <label>
        <input type="checkbox" bind:checked={manual} />
        Manual mode: {manual.toString()}
      </label>
    </p>

    <p>
      <label>
        <input type="checkbox" bind:checked={preserveUrl} />
        Preserve URL: {preserveUrl.toString()}
      </label>
    </p>

    <p>
      <label>
        Trigger mode: {triggerMode}
        <select bind:value={triggerMode}>
          <option value="onlyPrevious">onlyPrevious</option>
          <option value="onlyNext">onlyNext</option>
          <option value="both">both</option>
        </select>
      </label>
    </p>
  </div>

  <InfiniteScroll
    data="users"
    style="display: grid; gap: 20px"
    {manual}
    {preserveUrl}
    onlyNext={triggerMode === 'onlyNext'}
    onlyPrevious={triggerMode === 'onlyPrevious'}
  >
    {#snippet loading()}
      <div style="text-align: center; padding: 20px">Loading...</div>
    {/snippet}

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>

  <p>Total items on page: {users.data.length}</p>
</div>
