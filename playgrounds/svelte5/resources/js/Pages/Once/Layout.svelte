<script>
  import { inertia, router } from '@inertiajs/svelte'
  import MainLayout from '../../Components/Layout.svelte'

  let { children } = $props()
</script>

<MainLayout>
  {@render children()}
  <a href="/once/1" use:inertia class="text-blue-500 underline">Go to First Page</a>
  <a href="/once/2" use:inertia class="ml-4 text-blue-500 underline">Go to Second Page</a>
  <a href="/once/3" use:inertia class="ml-4 text-blue-500 underline">Go to Third Page</a>
  <a href="/once/4" use:inertia={{ prefetch: 'mount' }} class="ml-4 text-blue-500 underline">Go to Fourth Page</a>
  <button onclick={() => router.reload({ only: ['foo'] })} class="ml-4 text-blue-500 underline">Reload Foo</button>
  <button onclick={() => router.reload({ only: ['bar'] })} class="ml-4 text-blue-500 underline">Reload Bar</button>
  <button
    onclick={() => router.reload({ only: ['baz1', 'baz2', 'baz3', 'baz4'] })}
    class="ml-4 text-blue-500 underline"
  >
    Reload Baz
  </button>
  <button onclick={() => router.reload({ only: ['qux'] })} class="ml-4 text-blue-500 underline">Reload Qux</button>
</MainLayout>
