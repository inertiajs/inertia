<script>
  import { onMount, onDestroy } from 'svelte'
  import { page } from '@inertiajs/svelte'

  let time = new Date().getTime()

  onMount(() => {
    console.log(`Mounted <InnerLayout />`)
  })

  onDestroy(() => {
    console.log(`Destroyed <InnerLayout />`)
  })
</script>

<div class="fixed inset-x-0 bottom-0 p-2 bg-red-600 text-yellow-50 text-center">
    Layout #2 {time} {$page.url}
</div>

<slot />
