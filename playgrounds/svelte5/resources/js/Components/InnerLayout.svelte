<script>
  import { onMount, onDestroy } from 'svelte'
  import { inertia, page } from '@inertiajs/svelte'

  let { children } = $props()

  let time = new Date().getTime()

  onMount(() => {
    console.log(`Mounted <InnerLayout />`)
  })

  onDestroy(() => {
    console.log(`Destroyed <InnerLayout />`)
  })
</script>

<div class="fixed inset-x-0 bottom-0 p-2 bg-red-600 text-yellow-50 text-center">
  InnerLayout {time} {$page.url}
</div>

{@render children()}
