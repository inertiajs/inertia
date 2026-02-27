import { HeadManager, HeadManagerOnUpdateCallback, HeadManagerTitleCallback } from '.'
import debounce from './debounce'

const Renderer = {
  buildDOMElement(tag: string): ChildNode {
    const template = document.createElement('template')
    template.innerHTML = tag
    const node = template.content.firstChild as Element

    if (!tag.startsWith('<script ')) {
      return node
    }

    const script = document.createElement('script')
    script.innerHTML = node.innerHTML
    node.getAttributeNames().forEach((name) => {
      script.setAttribute(name, node.getAttribute(name) || '')
    })

    return script
  },

  isInertiaManagedElement(element: Element): boolean {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute('data-inertia') !== null
  },

  findMatchingElementIndex(element: Element, elements: Array<Element>): number {
    const key = element.getAttribute('data-inertia')
    if (key !== null) {
      return elements.findIndex((element) => element.getAttribute('data-inertia') === key)
    }

    return -1
  },

  update: debounce(function (elements: Array<string>) {
    const sourceElements = elements.map((element) => this.buildDOMElement(element))
    const targetElements = Array.from(document.head.childNodes).filter((element) =>
      this.isInertiaManagedElement(element as Element),
    )

    targetElements.forEach((targetElement) => {
      const index = this.findMatchingElementIndex(targetElement as Element, sourceElements)
      if (index === -1) {
        targetElement.remove()
        return
      }

      const sourceElement = sourceElements.splice(index, 1)[0]
      if (sourceElement && !targetElement.isEqualNode(sourceElement)) {
        targetElement.replaceWith(sourceElement)
      }
    })

    sourceElements.forEach((element) => document.head.appendChild(element))
  }, 1),
}

export default function createHeadManager(
  isServer: boolean,
  titleCallback: HeadManagerTitleCallback,
  onUpdate: HeadManagerOnUpdateCallback,
): HeadManager {
  const states: Record<string, Array<string>> = {}
  let lastProviderId = 0

  function connect(): string {
    const id = (lastProviderId += 1)
    states[id] = []
    return id.toString()
  }

  function disconnect(id: string): void {
    if (id === null || Object.keys(states).indexOf(id) === -1) {
      return
    }

    delete states[id]
    commit()
  }

  function reconnect(id: string): void {
    if (Object.keys(states).indexOf(id) === -1) {
      states[id] = []
    }
  }

  function update(id: string, elements: Array<string> = []): void {
    if (id !== null && Object.keys(states).indexOf(id) > -1) {
      states[id] = elements
    }

    commit()
  }

  function collect(): Array<string> {
    const title = titleCallback('')

    const defaults: Record<string, string> = {
      ...(title ? { title: `<title data-inertia="">${title}</title>` } : {}),
    }

    const elements = Object.values(states)
      .reduce((carry, elements) => carry.concat(elements), [])
      .reduce((carry, element) => {
        if (element.indexOf('<') === -1) {
          return carry
        }

        if (element.indexOf('<title ') === 0) {
          const title = element.match(/(<title [^>]+>)(.*?)(<\/title>)/)
          carry.title = title ? `${title[1]}${titleCallback(title[2])}${title[3]}` : element
          return carry
        }

        const match = element.match(/ data-inertia="[^"]+"/)
        if (match) {
          carry[match[0]] = element
        } else {
          carry[Object.keys(carry).length] = element
        }

        return carry
      }, defaults)

    return Object.values(elements)
  }

  function commit(): void {
    isServer ? onUpdate(collect()) : Renderer.update(collect())
  }

  // By committing during initialization, we can guarantee that the default
  // tags are set, as well as that they exist during SSR itself.
  commit()

  return {
    forceUpdate: commit,
    createProvider: function () {
      const id = connect()

      return {
        reconnect: () => reconnect(id),
        update: (elements) => update(id, elements),
        disconnect: () => disconnect(id),
      }
    },
  }
}
