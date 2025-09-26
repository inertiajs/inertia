<script lang="ts">
  import { inertia, router, useForm } from '@inertiajs/svelte5'
  const { pageNumber, lastLoaded, propType }: { pageNumber: any; lastLoaded: any; propType: string } = $props()

  const form = useForm({
    name: '',
  })

  function flushUserTags() {
    router.flushByCacheTags(propType === 'string' ? 'user' : ['user'])
  }

  function flushUserProductTags() {
    router.flushByCacheTags(['user', 'product'])
  }

  function programmaticPrefetch() {
    router.prefetch('/prefetch/tags/2', { method: 'get' }, { cacheTags: propType === 'string' ? 'user' : ['user'] })
    router.prefetch(
      '/prefetch/tags/3',
      { method: 'get' },
      { cacheFor: '1m', cacheTags: propType === 'string' ? 'product' : ['product'] },
    )
    router.prefetch(
      '/prefetch/tags/6',
      { method: 'get' },
      { cacheFor: '1m' }, // No tags (untagged)
    )
  }

  function submitWithUserInvalidation() {
    form.post('/dump/post', {
      invalidateCacheTags: propType === 'string' ? 'user' : ['user'],
    })
  }
</script>

<div>
  <div id="links">
    <a href="/prefetch/tags/1" use:inertia={{ prefetch: 'hover', cacheTags: ['user', 'profile'] }}> User Page 1 </a>
    <a href="/prefetch/tags/2" use:inertia={{ prefetch: 'hover', cacheTags: ['user', 'settings'] }}> User Page 2 </a>
    <a href="/prefetch/tags/3" use:inertia={{ prefetch: 'hover', cacheTags: ['product', 'catalog'] }}>
      Product Page 3
    </a>
    <a href="/prefetch/tags/4" use:inertia={{ prefetch: 'hover', cacheTags: ['product', 'details'] }}>
      Product Page 4
    </a>
    <a
      href="/prefetch/tags/5"
      use:inertia={{ prefetch: 'hover', cacheTags: propType === 'string' ? 'admin' : ['admin'] }}
    >
      Admin Page 5
    </a>
    <a href="/prefetch/tags/6" use:inertia={{ prefetch: 'hover' }}> Untagged Page 6 </a>
  </div>
  <div id="controls">
    <button id="flush-user" on:click={flushUserTags}> Flush User Tags </button>
    <button id="flush-user-product" on:click={flushUserProductTags}> Flush User + Product Tags </button>
    <button id="programmatic-prefetch" on:click={programmaticPrefetch}> Programmatic Prefetch </button>
  </div>

  <div id="form-section">
    <h3>Form Test</h3>
    <form on:submit|preventDefault>
      <input id="form-name" bind:value={form.name} type="text" placeholder="Enter name" />
      <button id="submit-invalidate-user" on:click={submitWithUserInvalidation}> Submit (Invalidate User) </button>
    </form>
  </div>

  <div>
    <div>This is tags page {pageNumber}</div>
    <div>
      Last loaded at <span id="last-loaded">{lastLoaded}</span>
    </div>
  </div>
</div>
