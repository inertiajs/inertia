<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let page: string
  export let loadedAt: number
</script>

<Link href="/history/prefetch/dashboard" prefetch cacheFor="1m">Dashboard</Link>
<Link href="/history/prefetch/reports" prefetch cacheFor="1m">Reports</Link>
<Link href="/history/prefetch/signed-out">Sign out</Link>

<div>This is the {page} page.</div>
<div>Loaded at: {loadedAt}</div>
