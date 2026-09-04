import {
  LayerExit,
  LayerShellProps,
  cancelLayer,
  layerDialogAttributes,
  lockScroll,
  observeExit,
  raiseLayer,
} from '@inertiajs/core'
import { createElement, ReactNode, useEffect, useRef } from 'react'

export default function Layer({ close, done, children, ...shell }: LayerShellProps & { children?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const doneRef = useRef(done)
  doneRef.current = done

  const exit = useRef<LayerExit>(null)
  exit.current ??= observeExit(
    () => dialog.current,
    () => doneRef.current(),
  )

  useEffect(() => {
    raiseLayer(dialog.current!, shell.isTop)

    const releaseScroll = lockScroll()

    return () => {
      exit.current!.teardown()
      releaseScroll()
    }
  }, [])

  useEffect(() => {
    exit.current!.toggle(shell.open)
  }, [shell.open])

  return createElement(
    'dialog',
    {
      ref: dialog,
      ...layerDialogAttributes(shell),
      onCancel: (event: Event) => cancelLayer(event, { isTop: shell.isTop, close }),
    },
    children,
  )
}
