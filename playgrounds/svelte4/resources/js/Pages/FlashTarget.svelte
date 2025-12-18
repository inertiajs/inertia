<script context="module">
  export { default as layout } from '../Components/FlashLayout.svelte'
</script>

<script>
  import { Link, page } from '@inertiajs/svelte'

  export let appName
</script>

<svelte:head>
  <title>Flash Target - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Flash Target</h1>

<div class="mt-6 space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Current page.flash</h2>
    <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{JSON.stringify($page.flash ?? 'null', null, 2)}</pre>
  </div>

  <div>
    <Link href="/flash" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Back to Flash</Link>
  </div>
</div>
