<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import UserCard, { type User } from './UserCard.svelte'

  export let users: { data: User[] }

  let manual = false
  let preserveUrl = false
  let triggerMode: 'onlyPrevious' | 'onlyNext' | 'both' = 'onlyNext'
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
    <div slot="loading" style="text-align: center; padding: 20px">Loading...</div>

    {#each users.data as user (user.id)}
      <UserCard {user} />
    {/each}
  </InfiniteScroll>

  <p>Total items on page: {users.data.length}</p>
</div>
