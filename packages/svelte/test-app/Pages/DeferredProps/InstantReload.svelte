<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  export let foo: { text: string } | undefined
  export let bar: { text: string } | undefined

  onMount(() => {
    router.reload({
      only: ['foo'],
    })
  })
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>
  <div>{foo?.text}</div>
</Deferred>

<Deferred data="bar">
  <svelte:fragment slot="fallback">
    <div>Loading bar...</div>
  </svelte:fragment>
  <div>{bar?.text}</div>
</Deferred>
