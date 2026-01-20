<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  const resolverPage = window.resolverReceivedPage
  const componentName = resolverPage?.component ?? 'N/A'
  const pageUrl = resolverPage?.url ?? 'N/A'
</script>

<div>
  <h1>Resolver Page Test</h1>
  <div id="resolver-component">Component: {componentName}</div>
  <div id="resolver-url">URL: {pageUrl}</div>
  <a id="go-to-second" href="/resolver-page/second" use:inertia>Go to Second Page</a>
</div>
