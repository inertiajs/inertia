import debounce from './debounce'

const Renderer = {
  buildDOMElement(tag: string) {
    const template = document.createElement('template')
    template.innerHTML = tag
    return template.content.firstChild
  },

  isInertiaManagedElement(element: any) {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute('inertia') !== null
  },

  findMatchingElementIndex(element: any, elements: Array<HTMLElement>) {
    const key = element.getAttribute('inertia')
    if (key !== null) {
      return elements.findIndex(element => element.getAttribute('inertia') === key)
    }

    return -1
  },

  update: debounce(function (elements: Array<string>) {
    const sourceElements = elements.map(element => this.buildDOMElement(element))
    const targetElements = Array.from(document.head.childNodes).filter(element => this.isInertiaManagedElement(element))

    targetElements.forEach(targetElement => {
      const index = this.findMatchingElementIndex(targetElement, sourceElements)
      if (index === -1) {
        targetElement?.parentNode?.removeChild(targetElement)
        return
      }

      const sourceElement = sourceElements.splice(index, 1)[0]
      if (sourceElement && ! targetElement.isEqualNode(sourceElement)) {
        // TODO: Whatever Claudio was going on about
        targetElement?.parentNode?.replaceChild(sourceElement, targetElement)
      }
    })

    sourceElements.forEach(element => document.head.appendChild(element))
  }, 50),
}

export default function (isServer: boolean) {
  let onUpdate: Function|null = null
  const states: Record<string, Array<string>> = {}
  let lastProviderId = 0

  function connect() {
    const id = (lastProviderId += 1)
    states[id] = []
    return id.toString()
  }

  function disconnect(id: string) {
    if (id === null || Object.keys(states).indexOf(id) === -1) {
      return
    }

    delete states[id]
    commit()
  }

  function update(id: string, elements: Array<string> = []) {
    if (id !== null && Object.keys(states).indexOf(id) > -1) {
      states[id] = elements
    }

    commit()
  }

  function collect() {
    const elements = Object.values(states)
      .reduce((carry, elements) => carry.concat(elements), [])
      .reduce((carry, element) => {
        if (element.indexOf('<') === -1) {
          return carry
        }

        if (element.indexOf('<title ') === 0 ) {
          carry.title = element
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

  function commit() {
    if (onUpdate instanceof Function) {
      onUpdate(collect())
    }

    if (isServer !== undefined && !isServer) {
      Renderer.update(collect())
    }
  }

  return {
    onUpdate(callback: Function): void {
      onUpdate = callback
    },
    createProvider: function () {
      const id = connect()

      return {
        disconnect: () => disconnect(id),
        update: (elements: Array<string>) => update(id, elements),
      }
    },
  }
}
