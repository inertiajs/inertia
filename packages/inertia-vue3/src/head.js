import { h, render } from 'vue'

export default {
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      provider: this.$headManager.createProvider(),
    }
  },
  beforeUnmount() {
    this.provider.disconnect()
  },
  methods: {
    addTitleElement(elements) {
      if (this.title && !elements.find(tag => tag.startsWith('<title'))) {
        elements.push(`<title inertia>${this.title}</title>`)
      }
      return elements
    },
  },
  render() {
    const el = document.createElement('div')

    render(h('div', this.$slots.default ? this.$slots.default() : []), el)

    const elements = Array.from(el.firstChild.childNodes)
      .filter(node => node.outerHTML)
      .map(node => {
        node.setAttribute('inertia', node.getAttribute('head-key') || '')
        return node.outerHTML
      })

    this.provider.update(
      this.addTitleElement(elements)
    )
  },
}
