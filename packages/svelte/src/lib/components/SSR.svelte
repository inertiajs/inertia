<script lang="ts">
  import type { Page } from '@inertiajs/core'
  import App from './App.svelte'

  export let id: string
  export let initialPage: Page
</script>

<div data-server-rendered="true" {id} data-page={JSON.stringify(initialPage)}>
  <App />
</div>
