<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  interface Props {
    foo: { text: string } | undefined
    bar: { text: string } | undefined
  }

  let { foo, bar }: Props = $props()

  onMount(() => {
    router.reload({
      only: ['foo'],
    })
  })
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
  <div>{foo?.text}</div>
</Deferred>

<Deferred data="bar">
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
  <div>{bar?.text}</div>
</Deferred>
