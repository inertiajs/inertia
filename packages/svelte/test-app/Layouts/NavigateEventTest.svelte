<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  let lastNavigateCached = $state('none')

  router.on('navigate', (event) => {
    lastNavigateCached = String(event.detail.cached)
  })
</script>

<div>
  Last navigate cached: <span id="last-navigate-cached">{lastNavigateCached}</span>
</div>

{@render children?.()}
