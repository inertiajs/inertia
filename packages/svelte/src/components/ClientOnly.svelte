<script lang="ts">
  import { canRenderClientOnly } from '@inertiajs/core'

  interface Props {
    children?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
  }

  let { children, fallback }: Props = $props()

  // `ClientOnly` renders `fallback` on its first render if and only if that render is
  // part of an SSR hydration pass for the current document. In every other case -- a
  // pure client-rendered boot, and every instance created after the initial hydration
  // commit (including after ordinary page remounts) -- it renders `children` on its
  // very first render. Local per-instance state can't express this: a remount creates
  // a new instance that restarts at "not mounted", so the "have we passed hydration"
  // signal has to live outside any single component instance (see `@inertiajs/core`'s
  // `hydrationBoot`).
  let mounted = $state(canRenderClientOnly())

  $effect(() => {
    mounted = true
  })
</script>

{#if mounted}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
