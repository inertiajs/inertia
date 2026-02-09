<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { Link, usePage, router } from '@inertiajs/svelte'

  let { appName } = $props()

  const page = usePage()

  let flashLog = $state([])

  router.on('flash', ({ detail: { flash } }) => {
    flashLog = [...flashLog, flash]
  })

  const triggerFrontendFlash = () => {
    router.flash('message', 'Hello from the frontend!')
  }

  const triggerMultipleFlash = () => {
    router.flash({
      message: 'Multiple items',
      count: 42,
    })
  }

  const clearLog = () => {
    flashLog = []
  }
</script>

<svelte:head>
  <title>Flash - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Flash</h1>

<div class="mt-6 space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Current page.flash</h2>
    <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{JSON.stringify(page.flash ?? 'null', null, 2)}</pre>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Flash Event Log</h2>
    <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{JSON.stringify(
        flashLog.length ? flashLog : 'No flash events yet',
        null,
        2,
      )}</pre>
    {#if flashLog.length}
      <button onclick={clearLog} class="mt-2 text-sm text-gray-500 underline">Clear log</button>
    {/if}
  </div>

  <div class="space-y-3">
    <h2 class="text-lg font-semibold">Server-side Flash</h2>
    <div>
      <Link href="/flash/direct" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Flash with render</Link>
    </div>
    <form
      onsubmit={(e) => {
        e.preventDefault()
        router.post('/flash/form')
      }}
    >
      <button type="submit" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Flash with redirect</button>
    </form>
  </div>

  <div class="space-y-3">
    <h2 class="text-lg font-semibold">Frontend Flash</h2>
    <div class="flex gap-3">
      <button onclick={triggerFrontendFlash} class="rounded-sm bg-slate-800 px-4 py-2 text-white">
        router.flash(key, value)
      </button>
      <button onclick={triggerMultipleFlash} class="rounded-sm bg-slate-800 px-4 py-2 text-white">
        router.flash(object)
      </button>
    </div>
  </div>
</div>
