<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  $: resolverPage = window.resolverReceivedPage
  $: componentName = resolverPage?.component ?? 'N/A'
  $: pageUrl = resolverPage?.url ?? 'N/A'
</script>

<div>
  <h1>Second Resolver Page</h1>
  <div id="resolver-component">Component: {componentName}</div>
  <div id="resolver-url">URL: {pageUrl}</div>
  <a id="go-to-first" href="/resolver-page" use:inertia>Go to First Page</a>
</div>
