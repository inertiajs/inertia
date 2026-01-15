<script>
  import { Link } from '@inertiajs/svelte'
  import { onMount, onDestroy } from 'svelte'

  export let page

  onMount(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
  })

  onDestroy(() => {
    document.documentElement.style.scrollBehavior = ''
  })
</script>

<div>
  <h1>{page === 'long' ? 'Long Page' : 'Short Page'}</h1>

  <div style="height: {page === 'long' ? '2000px' : '100px'}"></div>

  {#if page === 'long'}
    <Link href="/scroll-smooth/short">Go to Short Page</Link>
  {:else}
    <Link href="/scroll-smooth/long">Go to Long Page</Link>
  {/if}
</div>
