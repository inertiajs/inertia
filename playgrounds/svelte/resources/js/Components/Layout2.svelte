<script>
  import { onMount, onDestroy } from 'svelte'

  let time = new Date().getTime()

  onMount(() => {
    console.log(`Mounted <Layout2 />`)
  })

  onDestroy(() => {
    console.log(`Destroyed <Layout2 />`)
  })
</script>

<div class="fixed inset-x-0 bottom-0 p-2 bg-red-600 text-yellow-50 text-center">
    Layout #2 {time}
</div>

<slot />
