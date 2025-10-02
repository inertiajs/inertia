<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" itemsElement="tbody" let:loading>
  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr>
        <th style="padding: 8px; border: 1px solid #ccc">ID</th>
        <th style="padding: 8px; border: 1px solid #ccc">Name</th>
      </tr>
    </thead>

    <tbody>
      {#each users.data as user (user.id)}
        <tr data-user-id={user.id}>
          <td style="padding: 8px; border: 1px solid #ccc">{user.id}</td>
          <td style="padding: 8px; border: 1px solid #ccc">{user.name}</td>
        </tr>
      {/each}
    </tbody>

    <tfoot>
      {#if loading}
        <tr>
          <td colspan="2" style="padding: 8px; border: 1px solid #ccc; text-align: center"> Loading... </td>
        </tr>
      {/if}
    </tfoot>
  </table>
</InfiniteScroll>
