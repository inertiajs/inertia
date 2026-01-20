<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { type User } from './UserCard.svelte'

  export let users: { data: User[] }
</script>

<InfiniteScroll data="users" itemsElement="tbody">
  <table style="width: 100%; border-collapse: collapse">
    <tbody>
      {#each users.data as user (user.id)}
        <tr data-user-id={user.id}>
          <td style="padding: 10px; border: 1px solid #ccc">{user.id}</td>
          <td style="padding: 10px; border: 1px solid #ccc">{user.name}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</InfiniteScroll>
