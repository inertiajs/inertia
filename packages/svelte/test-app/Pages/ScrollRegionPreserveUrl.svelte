<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let page: number

  let scrollInterval: ReturnType<typeof setInterval> | null = null
  let items = Array.from({ length: 50 }, (_, i) => i + 1)

  const startScrollingAndNavigate = () => {
    const container = document.getElementById('scroll-container')!
    const nextPage = page === 1 ? 2 : 1

    // Start continuous scrolling
    scrollInterval = setInterval(() => {
      container.scrollTop += 10
    }, 10)

    // After 150ms of scrolling, navigate to the other page
    setTimeout(() => {
      router.visit(`/scroll-region-preserve-url/${nextPage}`, {
        preserveScroll: true,
        preserveState: true,
        preserveUrl: true,
        onSuccess: () => {
          // Stop scrolling after navigation
          if (scrollInterval) {
            clearInterval(scrollInterval)
            scrollInterval = null
          }
        },
      })
    }, 150)
  }
</script>

<div scroll-region id="scroll-container" style="height: 300px; overflow-y: auto; border: 1px solid #ccc">
  <div style="padding: 10px">
    <div class="page-number">Page: {page}</div>
    <button id="scroll-and-navigate" on:click={startScrollingAndNavigate}>Start scrolling and navigate</button>
    {#each items as num (num)}
      <div style="padding: 20px; border-bottom: 1px solid #eee">Item {num}</div>
    {/each}
  </div>
</div>
