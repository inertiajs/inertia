<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  interface Props {
    data: string | undefined
  }

  let { data }: Props = $props()
</script>

<Deferred data="data">
  {#snippet fallback()}
    <div>Loading data...</div>
  {/snippet}
  {data}
</Deferred>

<a href="/deferred-props/back-button/a" use:inertia>Go to Page A</a>
