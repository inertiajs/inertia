<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  export let fastProp: string | undefined
  export let slowProp: string | undefined
</script>

<Deferred data="fastProp">
  <svelte:fragment slot="fallback">
    <div>Loading fast prop...</div>
  </svelte:fragment>
  {fastProp}
</Deferred>

<Deferred data="slowProp">
  <svelte:fragment slot="fallback">
    <div>Loading slow prop...</div>
  </svelte:fragment>
  {slowProp}
</Deferred>

<a href="/deferred-props/back-button/b" use:inertia>Go to Page B</a>
