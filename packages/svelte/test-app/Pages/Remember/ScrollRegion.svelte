<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'

  const rows = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)

  let firstVisibleRow = $state(0)

  $effect(() => {
    router.remember(firstVisibleRow, 'firstVisibleRow')
  })

  const onScroll = (event: Event) => {
    firstVisibleRow = Math.floor((event.target as HTMLElement).scrollTop / 40)
  }
</script>

<div>
  <a href="/dump/get" use:inertia>Navigate away</a>
  <p>First visible row: {firstVisibleRow}</p>
  <div id="rows" scroll-region style="height: 200px; overflow-y: auto" onscroll={onScroll}>
    {#each rows as row (row)}
      <div style="height: 40px">{row}</div>
    {/each}
  </div>
</div>
