<script lang="ts">
  import {
    cancelLayer,
    layerDialogAttributes,
    lockScroll,
    observeExit,
    raiseLayer,
    type LayerShellProps,
  } from '@inertiajs/core'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  let { close, done, children, ...shell }: LayerShellProps & { children: Snippet } = $props()

  let dialog: HTMLDialogElement | undefined = $state()

  const exit = observeExit(
    () => dialog,
    () => done(),
  )

  onMount(() => {
    raiseLayer(dialog!, shell.isTop)

    const releaseScroll = lockScroll()

    return () => {
      exit.teardown()
      releaseScroll()
    }
  })

  const onCancel = (event: Event) => cancelLayer(event, { isTop: shell.isTop, close })

  $effect(() => {
    exit.toggle(shell.open)
  })
</script>

<dialog bind:this={dialog} {...layerDialogAttributes(shell)} oncancel={onCancel}>
  {@render children()}
</dialog>
