// The `<dialog>` mechanics behind the shipped Layer, kept here so all three adapters share them and
// an app replacing the `layer` option can build on them.

import type { LayerShellProps } from './types'

const exitTimeout = 2000

// What the shipped Layer puts on its dialog, including the marks `raiseLayer` reads back below.
export const layerDialogAttributes = (shell: Omit<LayerShellProps, 'close' | 'done'>) => ({
  open: true,
  'data-layer-index': shell.index,
  'data-layer-top': String(shell.isTop),
  'data-layer-closing': String(!shell.open),
  'data-layer-type': shell.type,
  'aria-label': shell.label,
})

// Chromium groups the close watchers of dialogs shown without user activation, so one Escape can
// reach every dialog in the group. Only the top layer answers it; the rest cannot refuse (their
// cancel is not cancelable), so they are re-shown once the browser has closed them.
export function cancelLayer(event: Event, shell: Pick<LayerShellProps, 'isTop' | 'close'>): void {
  event.preventDefault()

  if (shell.isTop) {
    shell.close()

    return
  }

  const dialog = event.target as HTMLDialogElement

  dialog.addEventListener(
    'close',
    () => {
      if (dialog.isConnected && dialog.dataset.layerClosing !== 'true') {
        raiseLayer(dialog, false)
      }
    },
    { once: true },
  )
}

let scrollLocks = 0
let unlocked: { overflow: string; scrollbarGutter: string } | null = null

// Locks the document's scroll, ref-counted across a stack, and returns its own release.
export function lockScroll(): () => void {
  const root = document.documentElement

  if (scrollLocks++ === 0) {
    unlocked = { overflow: root.style.overflow, scrollbarGutter: root.style.scrollbarGutter }
    root.style.overflow = 'hidden'
    root.style.scrollbarGutter = 'stable'
  }

  let released = false

  return () => {
    if (released) {
      return
    }

    released = true

    if (--scrollLocks === 0 && unlocked) {
      root.style.overflow = unlocked.overflow
      root.style.scrollbarGutter = unlocked.scrollbarGutter
      unlocked = null
    }
  }
}

// Puts a dialog on top of the browser's own stack. One already in the top layer has to leave it
// first: Chromium re-orders it in place, WebKit and Firefox leave it where it was, which sends
// Escape to whichever layer entered the top layer last rather than the one on top of the stack.
function showModal(dialog: HTMLDialogElement): void {
  if (dialog.matches(':modal')) {
    dialog.close()
  }

  dialog.removeAttribute('open')
  dialog.showModal()
}

export function raiseLayer(dialog: HTMLDialogElement, isTop: boolean): void {
  if (!dialog.matches(':modal')) {
    showModal(dialog)
  }

  if (isTop) {
    return
  }

  // A layer inserted beneath open ones mounts after them, so its showModal lands above dialogs it
  // belongs under. Re-showing each of those, bottom to top, keeps the stack the right way up.
  const index = Number(dialog.dataset.layerIndex)

  document
    .querySelectorAll<HTMLDialogElement>('dialog[data-layer-index]:not([data-layer-closing="true"])')
    .forEach((above) => {
      if (Number(above.dataset.layerIndex) > index && above.matches(':modal')) {
        showModal(above)
      }
    })
}

export interface LayerExit {
  /** The layer's `open` changed: false runs its exit, true abandons one already under way. */
  toggle(open: boolean): void
  teardown(): void
}

export function observeExit(dialog: () => HTMLDialogElement | null | undefined, done: () => void): LayerExit {
  let exiting = false
  let stop: (() => void) | null = null

  const teardown = () => {
    stop?.()
    stop = null
  }

  return {
    teardown,
    toggle(open) {
      if (open) {
        teardown()
        exiting = false

        const el = dialog()

        // An abandoned close whose exit already ran left the dialog closed, and only re-showing
        // it puts the layer back on screen.
        if (el && !el.matches(':modal')) {
          raiseLayer(el, el.dataset.layerTop === 'true')
        }

        return
      }

      if (exiting) {
        return
      }

      exiting = true

      const el = dialog()

      if (!el) {
        done()

        return
      }

      let finished = false

      const finish = () => {
        if (!finished) {
          finished = true
          teardown()
          // Closing is what hands focus back to whatever opened the layer, and only a dialog still
          // in the document can. Too late on unmount: React tears effects down after removing it.
          el.close()
          done()
        }
      }

      // The subtree counts: a shell that slides a panel inside the dialog animates that, not the
      // dialog. One that fills forwards stays listed once it has ended, and an endless one, a
      // spinner say, is not something an exit can wait for.
      const finishWhenIdle = () =>
        requestAnimationFrame(() => {
          const running = el
            .getAnimations({ subtree: true })
            .some(
              (animation) =>
                animation.playState === 'running' && animation.effect?.getComputedTiming().endTime !== Infinity,
            )

          if (!running) {
            finish()
          }
        })

      const timeout = setTimeout(finish, exitTimeout)

      el.addEventListener('transitionend', finishWhenIdle)
      el.addEventListener('animationend', finishWhenIdle)

      stop = () => {
        clearTimeout(timeout)
        el.removeEventListener('transitionend', finishWhenIdle)
        el.removeEventListener('animationend', finishWhenIdle)
      }

      requestAnimationFrame(finishWhenIdle)
    },
  }
}
