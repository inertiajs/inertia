<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface SearchResponse {
    items: string[]
    total: number
    query: string | null
  }

  const http = useHttp<{ query: string }, SearchResponse>({ query: '' })

  let effectRuns = 0
  let count = $state(0)
  let result: SearchResponse | null = $state(null)

  $effect(() => {
    effectRuns++
    count = effectRuns

    http.get('/api/data').then((data) => {
      result = data
    })
  })
</script>

<div>
  <h1>useHttp Stable Reference Test</h1>
  <div id="render-count">Render count: {count}</div>
  {#if http.recentlySuccessful}
    <div id="recently-successful">Recently successful</div>
  {/if}
  {#if result}
    <div id="result">Items: {result.items.join(', ')}</div>
  {/if}
</div>
