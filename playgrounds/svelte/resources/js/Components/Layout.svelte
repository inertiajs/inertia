<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<nav class="space-x-6 bg-slate-800 p-6 text-white">
  <a use:inertia href="/">Home</a>
  <a use:inertia href="/users">Users</a>
</nav>
<main class="p-6">
  <slot />
</main>
