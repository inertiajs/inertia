<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  export let appName
</script>

<nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
  <div class="rounded-lg bg-slate-700 px-4 py-1">{appName}</div>
  <!-- <Link href="/" prefetch class="hover:underline">Home</Link> -->
  <!-- <Link href="/users" prefetch cacheFor={['2s', '1m']} class="hover:underline">Users</Link> -->
  <!-- <Link href="/article" prefetch="click" class="hover:underline">Article</Link> -->
  <a href="/" use:inertia={{ prefetch: true }} class="hover:underline">Home</a>
  <a href="/users" use:inertia={{ prefetch: true, cacheFor: ['2s', '1m'] }} class="hover:underline">Users</a>
  <a href="/article" use:inertia={{ prefetch: 'click' }} class="hover:underline">Article</a>
  <a href="/form" use:inertia={{ prefetch: ['mount', 'click'] }} class="hover:underline">useForm</a>
  <a href="/form-component" use:inertia class="hover:underline">{'<Form>'}</a>
  <a href="/form-component/precognition" use:inertia class="hover:underline">Precognition</a>
  <button use:inertia={{ method: 'post', href: '/logout' }} type="button" class="hover:underline">Logout</button>
  <a href="/goodbye" use:inertia class="hover:underline">External</a>
  <a href="/async" use:inertia class="hover:underline">Async</a>
  <a href="/defer" use:inertia class="hover:underline">Defer</a>
  <a href="/poll" use:inertia class="hover:underline">Poll</a>
  <a href="/photo-grid" use:inertia class="hover:underline">Photo Grid</a>
  <a href="/photo-grid/horizontal" use:inertia class="hover:underline">Photo Row</a>
  <a href="/data-table" use:inertia class="hover:underline">Table</a>
  <a href="/once/1" use:inertia class="hover:underline">Once</a>
</nav>

<main class="px-10 py-8">
  <slot />
</main>
