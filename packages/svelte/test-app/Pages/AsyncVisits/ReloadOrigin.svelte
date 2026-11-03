<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  let reloadStatus = $state('idle')

  const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })

  const visitPage2AndReload = () => {
    router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => (reloadStatus = visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const visitRedirectAndReload = () => {
    router.visit('/async-visits/reload-origin/redirect', { preserveState: true })

    // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
    router.reload({
      data: { slow: 1 },
      preserveUrl: true,
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => (reloadStatus = visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const postAndReload = () => {
    router.post('/async-visits/reload-origin/like', {}, { preserveState: true })

    // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
    router.reload({
      data: { slow: 1 },
      preserveUrl: true,
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => (reloadStatus = visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const postToThisPageAndReload = () => {
    router.post('/async-visits/reload-origin')

    router.reload({ headers: { 'X-Repro-Delay': '1' } })
  }

  const reloadAndReplaceQuery = () => {
    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => (reloadStatus = visit.cancelled ? 'cancelled' : 'finished'),
    })

    router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
  }

  const visitPage3AsyncAndReplaceQuery = () => {
    router.visit('/async-visits/reload-origin?page=3', {
      async: true,
      preserveState: true,
      headers: { 'X-Repro-Delay': '1' },
    })

    router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
  }

  const reloadAndPostAsync = () => {
    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => (reloadStatus = visit.cancelled ? 'cancelled' : 'finished'),
    })

    router.post('/async-visits/reload-origin/like', {}, { async: true, preserveState: true })
  }
</script>

<div>Page: Reload Origin</div>

<button onclick={reload}>Reload</button>
<button onclick={visitPage2AndReload}>Visit page 2 and reload</button>
<button onclick={reloadAndPostAsync}>Reload and post async</button>
<button onclick={visitRedirectAndReload}>Visit redirect and reload</button>
<button onclick={postAndReload}>Post and reload</button>
<button onclick={postToThisPageAndReload}>Post to this page and reload</button>
<button onclick={reloadAndReplaceQuery}>Reload and replace query</button>
<button onclick={visitPage3AsyncAndReplaceQuery}>Visit page 3 async and replace query</button>
<Link href="/async-visits/page-c">Go to C</Link>

<div>Reload: {reloadStatus}</div>
