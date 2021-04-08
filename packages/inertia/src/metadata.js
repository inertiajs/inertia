import debounce from './debounce'

export const MetaManager = {
  state: {},

  generateNextStateProviderId() {
    return Math.max(0, ... Object.keys(this.state).map(id => parseInt(id))) + 1
  },

  connect() {
    const id = this.generateNextStateProviderId()
    this.state[id] = []
    return id
  },

  disconnect(providerId) {
    if (Object.keys(this.state).indexOf(providerId) > -1) {
      return
    }

    delete this.state[providerId]
    this.update()
  },

  collectElements() {
    return Object.values(this.state).reduce((carry, elements) => carry.concat(elements), [])
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
    if (id && Object.keys(this.state).indexOf(id.toString()) > -1) {
      this.state[id] = elements
    }
    this.repaint()
  },

  repaint: debounce(function () {
    const sourceElements = this.collectElements().filter(element => this.isInertiaManagedElement(element))
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
