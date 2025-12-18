<script>
  import { router } from '@inertiajs/svelte'
  import Layout from './Layout.svelte'

  let { children } = $props()

  let flashLog = $state([])

  router.on('flash', (event) => {
    flashLog = [...flashLog, event.detail.flash]
  })
</script>

<Layout>
  {@render children()}

  <div class="mt-8 border-t pt-6">
    <h2 class="text-lg font-semibold text-red-600">Flash Events (from Layout)</h2>
    <pre class="mt-2 rounded-sm bg-red-50 p-3 text-sm">{JSON.stringify(
        flashLog.length ? flashLog : 'No flash events yet',
        null,
        2,
      )}</pre>
    <p class="mt-2 text-sm text-gray-600">
      Layout flash event count: <strong>{flashLog.length}</strong>
    </p>
  </div>
</Layout>
