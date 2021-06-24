import debounce from './debounce'
import { HeadManager } from './types'

const Renderer = {
  buildDOMElement(tag: string): ChildNode {
    const template = document.createElement('template')
    template.innerHTML = tag
    const node = (template.content.firstChild as Element)

    if (!tag.startsWith('<script ')) {
      return node
    }

    const script = document.createElement('script')
    script.innerHTML = node.innerHTML
    node.getAttributeNames().forEach(name => {
      script.setAttribute(name, node.getAttribute(name) || '')
    })

    return script
  },

  isInertiaManagedElement(element: Element): boolean {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute('inertia') !== null
  },

  findMatchingElementIndex(element: Element, elements: Array<Element>): number {
    const key = element.getAttribute('inertia')
    if (key !== null) {
      return elements.findIndex(element => element.getAttribute('inertia') === key)
    }

    return -1
  },

  update: debounce(function (elements: Array<string>) {
    const sourceElements = elements.map(element => this.buildDOMElement(element))
    const targetElements = Array.from(document.head.childNodes).filter(element => this.isInertiaManagedElement(element as Element))

    targetElements.forEach(targetElement => {
      const index = this.findMatchingElementIndex((targetElement as Element), sourceElements)
      if (index === -1) {
        targetElement?.parentNode?.removeChild(targetElement)
        return
      }

      const sourceElement = sourceElements.splice(index, 1)[0]
      if (sourceElement && !targetElement.isEqualNode(sourceElement)) {
        targetElement?.parentNode?.replaceChild(sourceElement, targetElement)
      }
    })

    sourceElements.forEach(element => document.head.appendChild(element))
  }, 1),
}

export default function createHeadManager(isServer: boolean, titleCallback: ((title: string) => string), onUpdate: ((elements: string[]) => void)): HeadManager {
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

  function update(id: string, elements: Array<string> = []): void {
    if (id !== null && Object.keys(states).indexOf(id) > -1) {
      states[id] = elements
    }

    commit()
  }

  function collect(): Array<string> {
    const elements = Object.values(states)
      .reduce((carry, elements) => carry.concat(elements), [])
      .reduce((carry, element) => {
        if (element.indexOf('<') === -1) {
          return carry
        }

        if (element.indexOf('<title ') === 0) {
          const title = element.match(/(<title [^>]+>)(.*?)(<\/title>)/)
          carry.title = title ? `${title[1]}${titleCallback(title[2])}${title[3]}`: element
          return carry
        }

        const match = element.match(/ inertia="[^"]+"/)
        if (match) {
          carry[match[0]] = element
        } else {
          carry[Object.keys(carry).length] = element
        }

        return carry
      }, {} as Record<string, string>)

    return Object.values(elements)
  }

  function commit(): void {
    isServer ? onUpdate(collect()) : Renderer.update(collect())
  }

  return {
    createProvider: function () {
      const id = connect()

      return {
        update: (elements) => update(id, elements),
        disconnect: () => disconnect(id),
      }
    },
  }
}
