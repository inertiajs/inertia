import type { LayerShellProps, MountedLayerDialog } from '../types'

interface LayerExit {
  toggle(open: boolean): void
  teardown(): void
}

const exitTimeout = 2000

export const layerDialogAttributes = (shell: Omit<LayerShellProps, 'close' | 'done'>) => ({
  open: true,
  'data-layer-index': shell.index,
  'data-layer-top': String(shell.isTop),
  'data-layer-closing': String(!shell.open),
  'data-layer-type': shell.type,
})

// Chromium sends one Escape to every dialog shown without user activation, so only the top layer answers.
function cancelLayer(event: Event, shell: Pick<LayerShellProps, 'isTop' | 'close'>): void {
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

function lockScroll(): () => void {
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

// A dialog already in the top layer has to leave it first: Chromium re-orders it in place, WebKit and Firefox do not.
function showModal(dialog: HTMLDialogElement): void {
  if (dialog.matches(':modal')) {
    dialog.close()
  }

  dialog.removeAttribute('open')
  dialog.showModal()
}

function raiseLayer(dialog: HTMLDialogElement, isTop: boolean): void {
  if (!dialog.matches(':modal')) {
    showModal(dialog)
  }

  if (isTop) {
    return
  }

  const index = Number(dialog.dataset.layerIndex)

  document
    .querySelectorAll<HTMLDialogElement>('dialog[data-layer-index]:not([data-layer-closing="true"])')
    .forEach((above) => {
      if (Number(above.dataset.layerIndex) > index && above.matches(':modal')) {
        showModal(above)
      }
    })
}

function observeExit(dialog: () => HTMLDialogElement | null | undefined, done: () => void): LayerExit {
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
          // Only a dialog still in the document can hand focus back; on unmount React has already removed it.
          el.close()
          done()
        }
      }

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

export function mountLayerDialog(dialog: HTMLDialogElement, shell: LayerShellProps): MountedLayerDialog {
  let current = shell

  const exit = observeExit(
    () => dialog,
    () => current.done(),
  )
  const onCancel = (event: Event) => cancelLayer(event, current)

  raiseLayer(dialog, shell.isTop)

  const releaseScroll = lockScroll()

  dialog.addEventListener('cancel', onCancel)
  exit.toggle(shell.open)

  return {
    update(shell) {
      current = shell
      exit.toggle(shell.open)
    },
    unmount() {
      dialog.removeEventListener('cancel', onCancel)
      exit.teardown()
      releaseScroll()
    },
  }
}
