<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()

  let tableHeader: HTMLTableSectionElement = $state(null!)
  let tableFooter: HTMLTableSectionElement = $state(null!)
  let tableBody: HTMLTableSectionElement = $state(null!)
</script>

<div style="padding: 20px">
  <h1>Custom Triggers with Svelte Ref Objects Test</h1>

  <InfiniteScroll
    data="users"
    startElement={() => tableHeader}
    endElement={() => tableFooter}
    itemsElement={() => tableBody}
  >
    {#snippet children({ loading })}
      <div style="height: 300px; width: 100%; text-align: center; line-height: 300px; border: 1px solid #ccc">
        Spacer
      </div>

      <table style="width: 100%; border-collapse: collapse">
        <thead bind:this={tableHeader} style="padding: 10px">
          <tr>
            <th style="padding: 12px; border: 1px solid #ccc">ID</th>
            <th style="padding: 12px; border: 1px solid #ccc">Name</th>
          </tr>
        </thead>

        <tbody bind:this={tableBody}>
          {#each users.data as user (user.id)}
            <tr data-user-id={user.id}>
              <td style="padding: 80px 12px; border: 1px solid #ccc">{user.id}</td>
              <td style="padding: 80px 12px; border: 1px solid #ccc">{user.name}</td>
            </tr>
          {/each}

          {#if loading}
            <tr>
              <td colspan="2" style="padding: 12px; border: 1px solid #ccc; text-align: center"> Loading... </td>
            </tr>
          {/if}
        </tbody>

        <tfoot bind:this={tableFooter} style="background: #fdf2e8; padding: 10px">
          <tr>
            <td colspan="2" style="padding: 12px; border: 1px solid #ccc; text-align: center">
              Table Footer - Triggers when this comes into view
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="height: 300px; width: 100%; text-align: center; line-height: 300px; border: 1px solid #ccc">
        Spacer
      </div>
    {/snippet}
  </InfiniteScroll>
</div>
