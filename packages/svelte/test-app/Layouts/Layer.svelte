<script lang="ts">
  import { Layer, useLayer, usePage } from '@inertiajs/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    open: boolean
    index: number
    isTop: boolean
    type: 'routed' | 'local'
    close: () => void
    done: () => void
    children: Snippet
  }

  let { open, index, isTop, type, close, done, children }: Props = $props()

  const page = usePage()
  const layer = useLayer()
</script>

<Layer {open} {index} {isTop} {type} {close} {done} label={layer.id ? page.component : 'unresolved'}>
  {@render children()}
</Layer>
