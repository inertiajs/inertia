<script context="module" lang="ts">
  import type { Page } from '@inertiajs/core'
  export type SSRProps = { id: string; initialPage: Page }
</script>

<script lang="ts">
  import App from './App.svelte'

  interface $$Props extends SSRProps {}

  export let id: $$Props['id']
  export let initialPage: $$Props['initialPage']
</script>

<div data-server-rendered="true" {id} data-page={JSON.stringify(initialPage)}>
  <App />
</div>
