<script lang="ts">
  import type { Page } from '@inertiajs/core'
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'
  import { layerIdKey, layerPageKey } from '../page.svelte'

  let {
    page,
    layerId,
    children,
  }: {
    page: Page
    layerId: string
    children?: Snippet
  } = $props()

  // svelte-ignore state_referenced_locally
  const layerPage = $state<Page>({ ...page })

  $effect.pre(() => {
    Object.assign(layerPage, page)
  })

  setContext(layerPageKey, layerPage)
  // svelte-ignore state_referenced_locally
  setContext(layerIdKey, layerId)
</script>

{@render children?.()}
