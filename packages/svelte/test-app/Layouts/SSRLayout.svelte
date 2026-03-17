<script lang="ts">
import { useLayoutProps } from '@inertiajs/svelte'
import type { Snippet } from 'svelte'

let { children }: { children: Snippet } = $props()

const layoutProps = useLayoutProps({
  title: 'Default Title',
})
</script>

<div class="ssr-layout">
  <h1 data-testid="layout-title">{layoutProps.title}</h1>
  {@render children()}
</div>
