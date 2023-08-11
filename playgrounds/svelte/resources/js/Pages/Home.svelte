<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { inertia, Link } from '@inertiajs/svelte'
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1 class="text-3xl">Home</h1>

<p class="mt-6">
  <Link href="test"></Link>
  <a href="/article#far-down" use:inertia class="text-blue-700 underline">Link to bottom of article page</a>
</p>
