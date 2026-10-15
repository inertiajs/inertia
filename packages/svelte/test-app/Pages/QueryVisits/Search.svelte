<script lang="ts">
  import { Deferred, Link, router } from '@inertiajs/svelte'

  interface Props {
    term: string | null
    results?: string
    reloadedAt: number | null
  }

  let { term, results, reloadedAt }: Props = $props()
</script>

<div>
  <p id="term">Term: {term ?? 'nothing'}</p>
  <p id="reloaded-at">Reloaded at: {reloadedAt ?? 'never'}</p>

  <Deferred data="results">
    {#snippet fallback()}
      <p>Loading results...</p>
    {/snippet}

    <p id="results">{results}</p>
  </Deferred>

  <Link method="query" href="/query-visits/search" data={{ term: 'apple' }}>Search Apple</Link>
  <Link method="query" href="/query-visits/search" data={{ term: 'banana' }}>Search Banana</Link>
  <button onclick={() => router.reload({ only: ['reloadedAt'] })}>Reload</button>
  <button onclick={() => router.reload({ only: ['reloadedAt'], headers: { 'X-Slow': 'true' } })}>Slow reload</button>
  <button onclick={() => router.reload({ data: { term: 'cherry' } })}>Reload with Cherry</button>
  <button onclick={() => router.push({ url: '/query-visits/search-elsewhere' })}>Push elsewhere</button>
  <Link href="/dump/get">Leave</Link>
</div>
