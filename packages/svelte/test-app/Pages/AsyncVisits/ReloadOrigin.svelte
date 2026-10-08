<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })
</script>

<div>Page: Reload Origin</div>

<button onclick={reload}>Reload</button>
<Link href="/async-visits/page-c">Go to C</Link>
