<script lang="ts">
  import { Link } from '@inertiajs/svelte5'
  import type { CacheForOption, LinkPrefetchOption, Method } from '@inertiajs/core'

  let method: Method = 'get'
  let href = '/dump/get'
  let data = { foo: 'bar' }
  let headers = { 'X-Custom-Header': 'value' }
  let prefetch: boolean | LinkPrefetchOption = false
  let cacheFor: CacheForOption = 0

  function change() {
    method = 'post'
    href = '/dump/post'
    data = { foo: 'baz' }
    headers = { 'X-Custom-Header': 'new-value' }
  }

  function enablePrefetch() {
    prefetch = 'hover'
    cacheFor = '1s'
  }
</script>

<div>
  <span class="text">
    This page demonstrates reactivity in Inertia links. Click the button to change the link properties.
  </span>

  <Link {method} {href} {data} {headers}>Submit</Link>

  <button on:click={change}>Change Link Props</button>

  <Link href="/dump/get" {prefetch} {cacheFor}>Prefetch Link</Link>

  <button on:click={enablePrefetch}>Enable Prefetch (1s cache)</button>
</div>
