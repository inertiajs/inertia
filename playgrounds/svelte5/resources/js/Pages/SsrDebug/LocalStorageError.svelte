<script module>
  // This will cause an SSR error because localStorage doesn't exist in Node.js
  const savedTheme = localStorage.getItem('theme')
</script>

<script>
  import { inertia } from '@inertiajs/svelte'

  let { appName } = $props()
</script>

<svelte:head>
  <title>LocalStorage Error - SSR Debug - {appName}</title>
</svelte:head>

<h1 class="text-3xl">LocalStorage Error Demo</h1>

<p class="mt-6">
  If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
  console for the error message!
</p>

<p class="mt-4">
  Saved theme: <strong>{savedTheme || '(not set)'}</strong>
</p>

<p class="mt-6">
  <a href="/ssr-debug" use:inertia class="text-blue-700 underline">Back to SSR Debug</a>
</p>
