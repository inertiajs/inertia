<script lang="ts">
  import {
    layerDialogAttributes,
    mountLayerDialog,
    type LayerShellProps,
    type MountedLayerDialog,
  } from '@inertiajs/core'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  // Anything the app put on <Layer> that is not shell state lands on the dialog, so it can name and describe it.
  let {
    children,
    open,
    index,
    isTop,
    type,
    close,
    done,
    ...rest
  }: LayerShellProps & { children: Snippet } & HTMLAttributes<HTMLDialogElement> = $props()

  const shell = $derived<LayerShellProps>({ open, index, isTop, type, close, done })

  let dialog: HTMLDialogElement | undefined = $state()
  let mounted: MountedLayerDialog | undefined

  onMount(() => {
    mounted = mountLayerDialog(dialog!, shell)

    return () => mounted?.unmount()
  })

  $effect(() => {
    mounted?.update({ ...shell })
  })
</script>

<dialog bind:this={dialog} {...rest} {...layerDialogAttributes(shell)}>
  {@render children()}
</dialog>
