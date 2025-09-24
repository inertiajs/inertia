<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte5'
  import { onMount } from 'svelte'

  const { foo, bar }: { foo?: { text: string }; bar?: { text: string } } = $props()

  onMount(() => {
    router.reload({
      only: ['foo'],
    })
  })
</script>

<Deferred data="foo">
  <div>{foo?.text}</div>
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
</Deferred>

<Deferred data="bar">
  <div>{bar?.text}</div>
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
</Deferred>
