<script>
  import { Link } from '@inertiajs/svelte'
  import { onMount, onDestroy } from 'svelte'

  export let page

  // Apply scroll-behavior: smooth to html element
  onMount(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
  })

  onDestroy(() => {
    document.documentElement.style.scrollBehavior = ''
  })
</script>

<div class="scroll-smooth-page">
  <div class="header">
    <h1>{page === 'long' ? 'Long Page' : 'Short Page'}</h1>
    <p>Current scroll position: <span id="scroll-position">0</span></p>
  </div>

  <div class="content">
    {#if page === 'long'}
      {#each Array(50).keys() as i (i)}
        <div class="content-block">
          <h2>Section {i + 1}</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        </div>
      {/each}
    {:else}
      <div class="content-block">
        <h2>Short Content</h2>
        <p>This is a short page with minimal content.</p>
      </div>
    {/if}
  </div>

  <div class="navigation">
    {#if page === 'long'}
      <Link href="/scroll-smooth/short" class="nav-link">Go to Short Page</Link>
    {:else}
      <Link href="/scroll-smooth/long" class="nav-link">Go to Long Page</Link>
    {/if}
  </div>
</div>

<style>
  .scroll-smooth-page {
    padding: 20px;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 10px 20px;
    border-bottom: 1px solid #ccc;
    z-index: 100;
  }

  .content {
    margin-top: 80px;
  }

  .content-block {
    padding: 20px;
    margin: 10px 0;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .navigation {
    padding: 20px;
    margin-top: 20px;
  }

  :global(.nav-link) {
    display: inline-block;
    padding: 10px 20px;
    background: #4f46e5;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
</style>
