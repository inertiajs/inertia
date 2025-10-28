import modal from './modal'

export default {
  dialog: null as HTMLDialogElement | null,
  dialogStyleElement: null as HTMLStyleElement | null,
  iframe: null as HTMLIFrameElement | null,
  boundClickHandler: null as ((event: MouseEvent) => void) | null,
  boundEscapeHandler: null as ((event: KeyboardEvent) => void) | null,

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
    `
    document.head.appendChild(this.dialogStyleElement)

    this.iframe = iframe

    // Create bound handlers once for proper cleanup
    this.boundClickHandler = (event: MouseEvent) => {
      if (event.target === this.dialog) {
        this.hide()
      }
    }

    this.boundEscapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.hide()
      }
    }

    // Add event listeners
    this.dialog.addEventListener('click', this.boundClickHandler)
    this.iframe.addEventListener('load', () => {
      iframe.contentWindow?.document.addEventListener('keydown', this.boundEscapeHandler)
    })

    this.dialog.appendChild(iframe)
    document.body.prepend(this.dialog)
    this.dialog.showModal()

    if (!iframe.contentWindow) {
      throw new Error('iframe not yet ready.')
    }

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()
  },

  hide(): void {
    this.dialog.removeEventListener('click', this.boundClickHandler)
    this.iframe.contentWindow.document.removeEventListener('keydown', this.boundEscapeHandler)

    this.dialogStyleElement.remove()
    this.dialogStyleElement = null

    this.dialog.remove()
    this.dialog = null

    this.iframe = null
    this.boundClickHandler = null
    this.boundEscapeHandler = null
  },
}
