<script lang="ts">
  import { createBubbler, preventDefault } from 'svelte/legacy'

  const bubble = createBubbler()
  import { inertia, router, useForm } from '@inertiajs/svelte'
  interface Props {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    pageNumber: any
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    lastLoaded: any
    propType: string
  }

  let { pageNumber, lastLoaded, propType }: Props = $props()

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
    <button id="flush-user" onclick={flushUserTags}> Flush User Tags </button>
    <button id="flush-user-product" onclick={flushUserProductTags}> Flush User + Product Tags </button>
    <button id="programmatic-prefetch" onclick={programmaticPrefetch}> Programmatic Prefetch </button>
  </div>

  <div id="form-section">
    <h3>Form Test</h3>
    <form onsubmit={preventDefault(bubble('submit'))}>
      <input id="form-name" bind:value={form.name} type="text" placeholder="Enter name" />
      <button id="submit-invalidate-user" onclick={submitWithUserInvalidation}> Submit (Invalidate User) </button>
    </form>
  </div>

  <div>
    <div>This is tags page {pageNumber}</div>
    <div>
      Last loaded at <span id="last-loaded">{lastLoaded}</span>
    </div>
  </div>
</div>
