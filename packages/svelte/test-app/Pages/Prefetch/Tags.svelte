<script>
  import { inertia, router } from '@inertiajs/svelte'
  export let pageNumber
  export let lastLoaded

  function flushUserTags() {
    router.flushByTags(['user'])
  }

  function flushUserProductTags() {
    router.flushByTags(['user', 'product'])
  }
</script>

<div>
  <div id="links">
    <a href="/prefetch/tags/1" use:inertia={{ prefetch: 'hover', tags: ['user', 'profile'] }}>
      User Page 1
    </a>
    <a href="/prefetch/tags/2" use:inertia={{ prefetch: 'hover', tags: ['user', 'settings'] }}>
      User Page 2
    </a>
    <a href="/prefetch/tags/3" use:inertia={{ prefetch: 'hover', tags: ['product', 'catalog'] }}>
      Product Page 3
    </a>
    <a href="/prefetch/tags/4" use:inertia={{ prefetch: 'hover', tags: ['product', 'details'] }}>
      Product Page 4
    </a>
    <a href="/prefetch/tags/5" use:inertia={{ prefetch: 'hover', tags: ['admin'] }}>
      Admin Page 5
    </a>
    <a href="/prefetch/tags/6" use:inertia={{ prefetch: 'hover' }}>
      Untagged Page 6
    </a>
  </div>
  <div id="controls">
    <button id="flush-user" on:click={flushUserTags}>
      Flush User Tags
    </button>
    <button id="flush-user-product" on:click={flushUserProductTags}>
      Flush User + Product Tags
    </button>
  </div>
  <div>
    <div>This is tags page {pageNumber}</div>
    <div>
      Last loaded at <span id="last-loaded">{lastLoaded}</span>
    </div>
  </div>
</div>