<script>
  import { Link } from '@inertiajs/svelte'

  export let pageNumber
  export let largeData
</script>

<div>
  <h1>History Quota Test - Page {pageNumber}</h1>
  <p>Data size: {largeData?.length?.toLocaleString()} bytes</p>

  <div style="margin-top: 20px">
    {#each Array.from({ length: 20 }, (_, i) => i + 1) as n}
      <Link href={`/history-quota/${n}`} style="margin-right: 10px">
        Page {n}
      </Link>
    {/each}
  </div>

  <div style="height: 5000px"></div>
</div>
