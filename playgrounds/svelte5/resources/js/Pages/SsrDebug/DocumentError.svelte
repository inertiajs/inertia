<script module>
  export { default as layout } from '../../Components/Layout.svelte'

  // This will cause an SSR error because document doesn't exist in Node.js
  const bodyClasses = document.body.className
</script>

<script>
  import { inertia } from '@inertiajs/svelte'

  let { appName } = $props()
</script>

<svelte:head>
  <title>Document Error - SSR Debug - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Document Error Demo</h1>

<p class="mt-6">
  If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
  console for the error message!
</p>

<p class="mt-4">
  Body classes: <strong>{bodyClasses || '(none)'}</strong>
</p>

<p class="mt-6">
  <a href="/ssr-debug" use:inertia class="text-blue-700 underline">Back to SSR Debug</a>
</p>
