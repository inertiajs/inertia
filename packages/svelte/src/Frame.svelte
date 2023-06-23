<script>
  import { onMount } from 'svelte'
  import Render, { h } from './Render.svelte'
  import store from './store'
  import { router } from '@inertiajs/svelte'
  import { setContext } from 'svelte';

  export let src
  
  export let id = Math.random()
  setContext('inertia:frame-id', id)

  $: components = $store.frames?.[id] && h($store.frames[id].component.default, $store.frames[id].props)

  onMount(() => {
    router.visit(src, {
      target: id
    })
  })

</script>

<div data-inertia-frame-id={id}>
  <Render {...components} />
</div>
