import modal from './modal'

export default {
  show(html: Record<string, unknown> | string): void {
    const { iframe, page } = modal.createIframeAndPage(html)

    iframe.style.boxSizing = 'border-box'
    iframe.style.display = 'block'

    const dialog = document.createElement('dialog')
    dialog.id = 'inertia-error-dialog'

    // Style the dialog to mimic 50px padding
    Object.assign(dialog.style, {
      width: 'calc(100vw - 100px)',
      height: 'calc(100vh - 100px)',
      padding: '0',
      margin: 'auto',
      border: 'none',
      backgroundColor: 'transparent',
    })

    // There's no way to directly style the backdrop of a dialog, so we need to use a style element...
    const dialogStyleElement = document.createElement('style')
    dialogStyleElement.textContent = `
      dialog#inertia-error-dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6);
      }

      dialog#inertia-error-dialog:focus {
        outline: none;
      }
    `
    document.head.appendChild(dialogStyleElement)

    dialog.addEventListener('click', (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })

    dialog.addEventListener('close', () => {
      dialogStyleElement.remove()
      dialog.remove()
    })

    dialog.appendChild(iframe)
    document.body.prepend(dialog)
    dialog.showModal()

    // Focus the dialog so the 'Escape' key works immediately
    dialog.focus()

    if (!iframe.contentWindow) {
      throw new Error('iframe not yet ready.')
    }

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()
  },
}
