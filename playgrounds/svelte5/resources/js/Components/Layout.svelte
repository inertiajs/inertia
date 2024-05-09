<script>
  import { inertia, page } from '@inertiajs/svelte5'

  let { children } = $props()
</script>

<nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
  <div class="rounded-lg bg-slate-700 px-4 py-1">{page.current.props.appName}</div>
  <a href="/" use:inertia class="hover:underline">Home</a>
  <a href="/users" use:inertia class="hover:underline">Users</a>
  <a href="/article" use:inertia class="hover:underline">Article</a>
  <a href="/form" use:inertia class="hover:underline">Form</a>
  <button use:inertia={{ method: 'post', href: '/logout' }} type="button" class="hover:underline">Logout</button>
</nav>

<main class="px-10 py-8">
  {@render children()}
</main>
