<script>
  import { Link } from '@inertiajs/svelte'

  let method = 'get'
  let href = '/dump/get'
  let data = { foo: 'bar' }
  let headers = { 'X-Custom-Header': 'value' }

  function change() {
    method = 'post'
    href = '/dump/post'
    data = { foo: 'baz' }
    headers = { 'X-Custom-Header': 'new-value' }
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
</div>
