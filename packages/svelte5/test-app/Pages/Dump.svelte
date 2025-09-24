<script lang="ts">
  import { page } from '@inertiajs/svelte5'
  import type { Method } from '@inertiajs/core'
  import type { MulterFile } from '../types'

  const { headers, method, form, files = {}, url, query }: {
    headers: Record<string, string>;
    method: Method;
    form: Record<string, unknown>;
    files?: MulterFile[] | object;
    url: string;
    query: Record<string, unknown>;
  } = $props()

  const dump = {
    headers,
    method,
    form,
    files,
    query,
    url,
    $page: page,
  }

  // Set window dump for testing
  $effect(() => {
    window._inertia_request_dump = dump
  })
</script>

<div>
  <div class="text">This is Inertia page component containing a data dump of the request</div>
  <hr />
  <pre class="dump" style="white-space: pre-wrap; word-break: keep-all;">{JSON.stringify(dump)}</pre>
</div>
