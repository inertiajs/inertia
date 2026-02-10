export default {
  createIframeAndPage(html: Record<string, unknown> | string): { iframe: HTMLIFrameElement; page: HTMLElement } {
    if (typeof html === 'object') {
      html = `All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>${JSON.stringify(
        html,
      )}`
    }

    const page = document.createElement('html')
    page.innerHTML = html
    page.querySelectorAll('a').forEach((a) => a.setAttribute('target', '_top'))

    const iframe = document.createElement('iframe')
    iframe.style.backgroundColor = 'white'
    iframe.style.borderRadius = '5px'
    iframe.style.width = '100%'
    iframe.style.height = '100%'

    return { iframe, page }
  },

  show(html: Record<string, unknown> | string): void {
    const { iframe, page } = this.createIframeAndPage(html)

    iframe.style.boxSizing = 'border-box'
    iframe.style.display = 'block'

    const dialog = document.createElement('dialog')
    dialog.id = 'inertia-error-dialog'

    Object.assign(dialog.style, {
      width: 'calc(100vw - 100px)',
      height: 'calc(100vh - 100px)',
      padding: '0',
      margin: 'auto',
      border: 'none',
      backgroundColor: 'transparent',
    })

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

    dialog.focus()

    if (!iframe.contentWindow) {
      throw new Error('iframe not yet ready.')
    }

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()
  },
}
