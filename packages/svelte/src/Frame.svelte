<script>
  import { onMount } from 'svelte'
  import Render, { h } from './Render.svelte'
  import store from './store'
  import { router } from '@inertiajs/svelte'
  
  export let src

  export let id = Math.random()

  $: components = $store.frames?.[id] && h($store.frames[id].component.default, $store.frames[id].props)

  onMount(() => {
    router.visit(src, {
      target: id
    })
  })
</script>

<Render {...components} />
