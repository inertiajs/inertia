<script context="module" lang="ts">
  import type { Page } from '@inertiajs/core'

  type SSRProps = { id: string; initialPage: Page }
</script>

<script lang="ts">
  import App from './App.svelte'

  let { id, initialPage }: SSRProps = $props()
</script>

<div data-server-rendered="true" {id} data-page={JSON.stringify(initialPage)}>
  <App />
</div>
