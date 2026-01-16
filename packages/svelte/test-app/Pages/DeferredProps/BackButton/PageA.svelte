<script lang="ts">
  import { Deferred, inertia } from '@inertiajs/svelte'

  interface Props {
    fastProp: string | undefined
    slowProp: string | undefined
  }

  let { fastProp, slowProp }: Props = $props()
</script>

<Deferred data="fastProp">
  {#snippet fallback()}
    <div>Loading fast prop...</div>
  {/snippet}
  {fastProp}
</Deferred>

<Deferred data="slowProp">
  {#snippet fallback()}
    <div>Loading slow prop...</div>
  {/snippet}
  {slowProp}
</Deferred>

<a href="/deferred-props/back-button/b" use:inertia>Go to Page B</a>
