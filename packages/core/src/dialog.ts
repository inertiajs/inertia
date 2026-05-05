import { config } from './config'

const DIALOG_ID = 'inertia-error-dialog'

const STYLE_CONTENT = `
  #${DIALOG_ID} {
    width: calc(100vw - 100px);
    height: calc(100vh - 100px);
    padding: 0;
    margin: auto;
    border: none;
    background-color: transparent;
  }

  #${DIALOG_ID} > iframe {
    background-color: white;
    border-radius: 5px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: block;
  }

  #${DIALOG_ID}::backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }

  #${DIALOG_ID}:focus {
    outline: none;
  }
`

let styleInstalled = false

const installStyle = (): void => {
  if (styleInstalled) {
    return
  }

  const style = document.createElement('style')
  const nonce = config.get('nonce')

  if (nonce) {
    style.nonce = nonce
  }

  style.textContent = STYLE_CONTENT
  document.head.appendChild(style)

  styleInstalled = true
}

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
    iframe.setAttribute('sandbox', 'allow-scripts')

    return { iframe, page }
  },

  show(html: Record<string, unknown> | string): void {
    const { iframe, page } = this.createIframeAndPage(html)

    installStyle()

    const dialog = document.createElement('dialog')
    dialog.id = DIALOG_ID

    dialog.addEventListener('click', (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })

    dialog.addEventListener('close', () => {
      dialog.remove()
    })

    dialog.appendChild(iframe)
    document.body.prepend(dialog)
    dialog.showModal()

    dialog.focus()

    iframe.srcdoc = page.outerHTML
  },
}
