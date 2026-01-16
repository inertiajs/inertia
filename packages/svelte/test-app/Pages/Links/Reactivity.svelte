<script lang="ts">
  import { Link } from '@inertiajs/svelte'
  import type { CacheForOption, LinkPrefetchOption, Method } from '@inertiajs/core'

  let method: Method = $state('get')
  let href = $state('/dump/get')
  let data = $state({ foo: 'bar' })
  let headers = $state({ 'X-Custom-Header': 'value' })
  let prefetch: boolean | LinkPrefetchOption = $state(false)
  let cacheFor: CacheForOption = $state(0)

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

  <button onclick={change}>Change Link Props</button>

  <Link href="/dump/get" {prefetch} {cacheFor}>Prefetch Link</Link>

  <button onclick={enablePrefetch}>Enable Prefetch (1s cache)</button>
</div>
