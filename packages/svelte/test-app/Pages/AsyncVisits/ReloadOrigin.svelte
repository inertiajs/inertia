<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  let reloadStatus = $state('idle')

  const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })

  const visitPage2AndReload = () => {
    router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: () => (reloadStatus = 'finished'),
    })
  }
</script>

<div>Page: Reload Origin</div>

<button onclick={reload}>Reload</button>
<button onclick={visitPage2AndReload}>Visit page 2 and reload</button>
<Link href="/async-visits/page-c">Go to C</Link>

<div>Reload: {reloadStatus}</div>
