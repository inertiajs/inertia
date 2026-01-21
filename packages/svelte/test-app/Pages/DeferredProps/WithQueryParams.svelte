<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    filter: string
    users: { text: string } | undefined
  }

  let { filter, users }: Props = $props()
</script>

<div>Filter: {filter}</div>

<Deferred data="users">
  {#snippet fallback()}
    <div>Loading users...</div>
  {/snippet}
  <div>{users?.text}</div>
</Deferred>
