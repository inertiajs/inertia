<script>
  import { beforeUpdate } from 'svelte'
  import { page } from '@inertiajs/svelte'

  export let headers
  export let method
  export let form
  export let files = {}
  export let query

  const dump = {
    headers,
    method,
    form,
    files,
    query,
    $page: $page,
  }

  beforeUpdate(() => {
    window._inertia_request_dump = {
      headers,
      method,
      form,
      files,
      query,
      $page: $page,
    }
  })
</script>

<div>
  <div class="text">This is Inertia page component containing a data dump of the request</div>
  <hr />
  <pre class="dump" style="white-space: pre-wrap; word-break: keep-all;">{JSON.stringify(dump)}</pre>
</div>
