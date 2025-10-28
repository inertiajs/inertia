import modal from './modal'

export default {
  dialog: null as HTMLDialogElement | null,
  dialogStyleElement: null as HTMLStyleElement | null,
  iframe: null as HTMLIFrameElement | null,

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

    // Add event listeners
    this.dialog.addEventListener('click', (event: MouseEvent) => {
      if (event.target === this.dialog) {
        this.dialog.close()
      }
    })

    this.dialog.addEventListener('close', () => {
      this.dialogStyleElement?.remove()
      this.dialogStyleElement = null

      this.dialog?.remove()
      this.dialog = null

      this.iframe = null
    })

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
}
