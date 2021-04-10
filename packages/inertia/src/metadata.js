import debounce from './debounce'

export const MetaManager = {
  states: {},
  ssrCallback: null,
  nextProviderId: 0,

  onSsrUpdate(callback) {
    this.ssrCallback = callback
  },

  generateNextStateProviderId() {
    return this.nextProviderId += 1
  },

  connect() {
    const id = this.generateNextStateProviderId()
    this.states[id] = []
    return id
  },

  disconnect(providerId) {
    if (Object.keys(this.states).indexOf(providerId) > -1) {
      return
    }

    delete this.states[providerId]
    this.update()
  },

  collectElements() {
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

  buildDOMElement(tag) {
    const template = document.createElement('template')
    template.innerHTML = tag
    return template.content.firstChild
  },

  isInertiaManagedElement(element) {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute('inertia') !== null
  },

  findElementIndex(element, elements) {
    const key = element.getAttribute('inertia')
    if (key !== null) {
      return elements.findIndex(element => element.getAttribute('inertia') === key)
    }

    return -1
  },

  update(id = null, elements = []) {
    if (id && Object.keys(this.states).indexOf(id.toString()) > -1) {
      this.states[id] = elements
    }

    if (this.ssrCallback instanceof Function) {
      return this.ssrCallback(this.collectElements())
    }

    this.repaint()
  },

  repaint: debounce(function () {
    const sourceElements = this.collectElements().map(element => this.buildDOMElement(element))
    const targetElements = Array.from(document.head.childNodes).filter(element => this.isInertiaManagedElement(element))

    targetElements.forEach(element => {
      const index = this.findElementIndex(element, sourceElements)
      index > -1
        ? element.parentNode.replaceChild(sourceElements.splice(index, 1)[0], element)
        : element.parentNode.removeChild(element)
    })

    sourceElements.forEach(element => document.head.appendChild(element))
  }),
}
