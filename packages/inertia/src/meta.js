import debounce from './debounce'

const Renderer = {
  buildDOMElement(tag) {
    const template = document.createElement('template')
    template.innerHTML = tag
    return template.content.firstChild
  },

  isInertiaManagedElement(element) {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute('inertia') !== null
  },

  findMatchingElementIndex(element, elements) {
    const key = element.getAttribute('inertia')
    if (key !== null) {
      return elements.findIndex(element => element.getAttribute('inertia') === key)
    }

    return -1
  },

  update: debounce(function (elements) {
    const sourceElements = elements.map(element => this.buildDOMElement(element))
    const targetElements = Array.from(document.head.childNodes).filter(element => this.isInertiaManagedElement(element))

    targetElements.forEach(targetElement => {
      const index = this.findMatchingElementIndex(targetElement, sourceElements)
      if (index === -1) {
        targetElement.parentNode.removeChild(targetElement)
      }

      const sourceElement = sourceElements.splice(index, 1)[0]
      if (sourceElement && ! targetElement.isEqualNode(sourceElement)) {
        targetElement.parentNode.replaceChild(sourceElement, targetElement)
      }
    })

    sourceElements.forEach(element => document.head.appendChild(element))
  }),
}

const Manager = {
  inertia: null,
  onUpdate: null,
  states: {},
  lastProviderId: 0,

  connect() {
    const id = (this.lastProviderId += 1)
    this.states[id] = []
    return id.toString()
  },

  disconnect(id) {
    if (id === null || Object.keys(this.states).indexOf(id) === -1) {
      return
    }

    delete this.states[id]
    this.commit()
  },

  update(id, elements = []) {
    if (id !== null && Object.keys(this.states).indexOf(id) > -1) {
      this.states[id] = elements
    }

    this.commit()
  },

  collect() {
    const elements = Object.values(this.states)
      .reduce((carry, elements) => carry.concat(elements))
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
      }, {})

    return Object.values(elements)
  },

  commit() {
    if (this.onUpdate instanceof Function) {
      this.onUpdate(this.collect())
    }

    if (this.inertia && !this.inertia.serverMode) {
      Renderer.update(this.collect())
    }
  },
}

export default {
  init(inertia) {
    Manager.inertia = inertia
  },
  onUpdate(callback) {
    Manager.onUpdate = callback
  },
  createProvider: function () {
    const id = Manager.connect()

    return {
      disconnect() {
        Manager.disconnect(id)
      },
      update(elements) {
        Manager.update(id, elements)
      },
    }
  },
}
