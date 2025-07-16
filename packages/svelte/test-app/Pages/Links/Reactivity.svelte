<script>
  import { Link } from '@inertiajs/svelte'

  let method = 'get'
  let href = '/dump/get'
  let data = { foo: 'bar' }
  let headers = { 'X-Custom-Header': 'value' }
  let prefetch = false
  let cacheFor = 0

  function change() {
    method = 'post'
    href = '/dump/post'
    data = { foo: 'baz' }
    headers = { 'X-Custom-Header': 'new-value' }
  }

  function changePrefetch() {
    prefetch = 'hover'
    cacheFor = '5s'
  }
</script>

<div>
  <span class="text">
    This page demonstrates reactivity in Inertia links. Click the button to change the link properties.
  </span>

  <Link method={method} href={href} data={data} headers={headers}>
    Submit
  </Link>

  <button on:click={change}>Change Link Props</button>

  <Link href="/dump/get" {prefetch} {cacheFor}>
    Prefetch Link
  </Link>

  <button on:click={changePrefetch}>Enable Prefetch</button>
</div>
