<script>
  import { inertia, usePage } from '@inertiajs/svelte'

  let { children } = $props()

  const page = usePage()
</script>

<nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
  <div class="rounded-lg bg-slate-700 px-4 py-1">{page.props.appName}</div>
  <a href="/" use:inertia class="hover:underline">Home</a>
  <a href="/users" use:inertia class="hover:underline">Users</a>
  <a href="/article" use:inertia class="hover:underline">Article</a>
  <a href="/form" use:inertia class="hover:underline">useForm</a>
  <a href="/form-component" use:inertia class="hover:underline">{'<Form>'}</a>
  <a href="/form-component/precognition" use:inertia class="hover:underline">Precognition</a>
  <a href="/photo-grid" use:inertia class="hover:underline">Photo Grid</a>
  <a href="/photo-grid/horizontal" use:inertia class="hover:underline">Photo Row</a>
  <a href="/data-table" use:inertia class="hover:underline">Table</a>
  <a href="/once/1" use:inertia class="hover:underline">Once</a>
  <a href="/optimistic" use:inertia class="hover:underline">Optimistic</a>
  <a href="/flash" use:inertia class="hover:underline">Flash</a>
  <a href="/error/404" use:inertia class="hover:underline">Errors</a>
  <a href="/ssr-debug" use:inertia class="hover:underline">SSR Debug</a>
  <button use:inertia={{ method: 'post', href: '/logout' }} type="button" class="hover:underline">Logout</button>
</nav>

<main class="px-10 py-8">
  {@render children()}
</main>
