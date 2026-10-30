<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    term: string | null
  }

  let { term }: Props = $props()
</script>

<div>
  <p id="results">Results for: {term ?? 'nothing'}</p>

  <Link method="query" href="/prefetch/query" data={{ term: 'apple' }} prefetch>Search Apple</Link>
  <Link method="query" href="/prefetch/query" data={{ term: 'banana' }} prefetch>Search Banana</Link>
</div>
