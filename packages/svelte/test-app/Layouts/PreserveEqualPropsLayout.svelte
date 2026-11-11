<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'

  interface Props {
    file: { url: string; pages: number }
    children?: Snippet
  }

  let { file, children }: Props = $props()

  let layoutEffectCount = $state(0)

  $effect(() => {
    void file

    untrack(() => {
      layoutEffectCount++
    })
  })
</script>

<div>
  <p id="layout-effect-count">Layout effect count: {layoutEffectCount}</p>
  {@render children?.()}
</div>
