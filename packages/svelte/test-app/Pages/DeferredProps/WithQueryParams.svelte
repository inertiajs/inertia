<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  export let filter: string
  export let users: { text: string } | undefined
</script>

<div>Filter: {filter}</div>

<Deferred data="users">
  <svelte:fragment slot="fallback">
    <div>Loading users...</div>
  </svelte:fragment>
  <div>{users?.text}</div>
</Deferred>
