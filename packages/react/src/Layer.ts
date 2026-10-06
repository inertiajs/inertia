import { LayerShellProps, MountedLayerDialog, layerDialogAttributes, mountLayerDialog } from '@inertiajs/core'
import { createElement, HTMLAttributes, ReactNode, useEffect, useRef } from 'react'

export default function Layer(props: LayerShellProps & { children?: ReactNode } & HTMLAttributes<HTMLDialogElement>) {
  // Anything the app put on <Layer> that is not shell state lands on the dialog, so it can name and describe it.
  const { children, open, index, isTop, type, close, done, ...rest } = props as typeof props & Record<string, unknown>
  const shell: LayerShellProps = { open, index, isTop, type, close, done }

  const dialog = useRef<HTMLDialogElement>(null)
  const mounted = useRef<MountedLayerDialog>(null)

  useEffect(() => {
    mounted.current = mountLayerDialog(dialog.current!, shell)

    return () => mounted.current?.unmount()
  }, [])

  useEffect(() => {
    mounted.current?.update(shell)
  }, [open, index, isTop, type, close, done])

  return createElement('dialog', { ref: dialog, ...rest, ...layerDialogAttributes(shell) }, children)
}
