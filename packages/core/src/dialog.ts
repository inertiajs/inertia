import modal from './modal'

export default {
  dialog: null as HTMLDialogElement | null,
  dialogStyleElement: null as HTMLStyleElement | null,
  iframe: null as HTMLIFrameElement | null,
  boundClickHandler: null as ((event: MouseEvent) => void) | null,
  boundCancelHandler: null as (() => void) | null,
  boundCloseHandler: null as (() => void) | null,

  show(html: Record<string, unknown> | string): void {
    const { iframe, page } = modal.createIframeAndPage(html)

    iframe.style.boxSizing = 'border-box'
    iframe.style.display = 'block'

    this.dialog = document.createElement('dialog')
    this.dialog.id = 'inertia-error-dialog'

    // Style the dialog to mimic 50px padding
    Object.assign(this.dialog.style, {
      width: 'calc(100vw - 100px)',
      height: 'calc(100vh - 100px)',
      padding: '0',
      margin: 'auto',
      border: 'none',
      backgroundColor: 'transparent',
    })

    this.dialogStyleElement = document.createElement('style')
    this.dialogStyleElement.textContent = `
      dialog#inertia-error-dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6);
      }
      dialog#inertia-error-dialog:focus {
        outline: none;
      }
    `
    document.head.appendChild(this.dialogStyleElement)

    this.iframe = iframe

    // Create bound handlers once for proper cleanup
    this.boundClickHandler = (event: MouseEvent) => {
      if (event.target === this.dialog) {
        this.dialog.close()
      }
    }

    this.boundCancelHandler = () => {
      this.dialog.close()
    }

    this.boundCloseHandler = () => {
      this.hide()
    }

    // Add event listeners
    this.dialog.addEventListener('click', this.boundClickHandler)
    this.dialog.addEventListener('cancel', this.boundCancelHandler)
    this.dialog.addEventListener('close', this.boundCloseHandler)

    this.dialog.appendChild(iframe)
    document.body.prepend(this.dialog)
    this.dialog.showModal()

    // Focus the dialog so the 'Escape' key works immediately
    this.dialog.focus()

    if (!iframe.contentWindow) {
      throw new Error('iframe not yet ready.')
    }

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()
  },

  hide(): void {
    if (this.dialog) {
      this.dialog.removeEventListener('click', this.boundClickHandler)
      this.dialog.removeEventListener('cancel', this.boundCancelHandler)
      this.dialog.removeEventListener('close', this.boundCloseHandler)
    }

    this.dialogStyleElement?.remove()
    this.dialogStyleElement = null

    this.dialog?.remove()
    this.dialog = null

    this.iframe = null
    this.boundClickHandler = null
    this.boundCancelHandler = null
    this.boundCloseHandler = null
  },
}
