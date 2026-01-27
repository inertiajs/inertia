<script>
  import { page } from '@inertiajs/svelte'

  // Access props from page store - this component only renders when Deferred shows slot
  $: results = $page.props.results
</script>

<div id="results-data">{results.data.join(', ')}</div>
<div id="results-page">Page: {results.page}</div>
