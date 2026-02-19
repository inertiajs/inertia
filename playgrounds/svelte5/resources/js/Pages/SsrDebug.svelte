<script>
  import { inertia } from '@inertiajs/svelte'

  let { appName } = $props()
</script>

<svelte:head>
  <title>SSR Debug - {appName}</title>
</svelte:head>

<h1 class="text-3xl">SSR Error Debugging</h1>

<div class="mt-6 max-w-2xl space-y-4">
  <p class="text-gray-700">
    This page demonstrates the improved SSR error messages in the Vite plugin. Click on any of the links below to
    trigger a specific SSR error. Check your <strong>Vite dev server console</strong> to see the helpful error messages with
    hints on how to fix them.
  </p>

  <div class="rounded-lg bg-yellow-50 p-4 text-yellow-800">
    <strong>Note:</strong> When SSR fails, Laravel falls back to client-side rendering, so the page will still load. The important
    part is the error message in your terminal.
  </div>
</div>

<h2 class="mt-8 text-xl font-semibold">Browser API Errors</h2>
<p class="mt-2 text-gray-600">These errors occur when browser-only APIs are accessed during SSR.</p>

<ul class="mt-4 space-y-2">
  <li>
    <a href="/ssr-debug/window" use:inertia class="text-blue-700 underline">window is not defined</a>
    <span class="ml-2 text-gray-500">- Accessing window.innerWidth at module level</span>
  </li>
  <li>
    <a href="/ssr-debug/document" use:inertia class="text-blue-700 underline">document is not defined</a>
    <span class="ml-2 text-gray-500">- Accessing document.body at module level</span>
  </li>
  <li>
    <a href="/ssr-debug/localstorage" use:inertia class="text-blue-700 underline">localStorage is not defined</a>
    <span class="ml-2 text-gray-500">- Accessing localStorage at module level</span>
  </li>
</ul>

<h2 class="mt-8 text-xl font-semibold">Expected Console Output</h2>
<p class="mt-2 text-gray-600">
  When you click one of the links above, you should see something like this in your Vite console:
</p>

<pre class="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
2024-01-15 10:30:45 SSR Error [SsrDebug/WindowError]
ReferenceError: window is not defined

Hint: The global window object doesn't exist in Node.js.
Wrap browser-specific code in a onMounted/useEffect/onMount
lifecycle hook, or check "typeof window !== 'undefined'"
before using it.</pre>
