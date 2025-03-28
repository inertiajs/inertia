import { defineComponent, DefineComponent } from 'vue'

export type InertiaHead = DefineComponent<{
  title?: string
}>

const Head: InertiaHead = defineComponent({
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
    isUnaryTag(node) {
      return (
        [
          'area',
          'base',
          'br',
          'col',
          'embed',
          'hr',
          'img',
          'input',
          'keygen',
          'link',
          'meta',
          'param',
          'source',
          'track',
          'wbr',
        ].indexOf(node.type) > -1
      )
    },
    renderTagStart(node) {
      node.props = node.props || {}
      node.props.inertia = node.props['head-key'] !== undefined ? node.props['head-key'] : ''
      const attrs = Object.keys(node.props).reduce((carry, name) => {
        const value = node.props[name]
        if (['key', 'head-key'].includes(name)) {
          return carry
        } else if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${value}"`
        }
      }, '')
      return `<${node.type}${attrs}>`
    },
    renderTagChildren(node) {
      return typeof node.children === 'string'
        ? node.children
        : node.children.reduce((html, child) => html + this.renderTag(child), '')
    },
    isFunctionNode(node) {
      return typeof node.type === 'function'
    },
    isComponentNode(node) {
      return typeof node.type === 'object'
    },
    isCommentNode(node) {
      return /(comment|cmt)/i.test(node.type.toString())
    },
    isFragmentNode(node) {
      return /(fragment|fgt|symbol\(\))/i.test(node.type.toString())
    },
    isTextNode(node) {
      return /(text|txt)/i.test(node.type.toString())
    },
    renderTag(node) {
      if (this.isTextNode(node)) {
        return node.children
      } else if (this.isFragmentNode(node)) {
        return ''
      } else if (this.isCommentNode(node)) {
        return ''
      }
      let html = this.renderTagStart(node)
      if (node.children) {
        html += this.renderTagChildren(node)
      }
      if (!this.isUnaryTag(node)) {
        html += `</${node.type}>`
      }
      return html
    },
    addTitleElement(elements) {
      if (this.title && !elements.find((tag) => tag.startsWith('<title'))) {
        elements.push(`<title inertia>${this.title}</title>`)
      }
      return elements
    },
    renderNodes(nodes) {
      return this.addTitleElement(
        nodes
          .flatMap((node) => this.resolveNode(node))
          .map((node) => this.renderTag(node))
          .filter((node) => node),
      )
    },
    resolveNode(node) {
      if (this.isFunctionNode(node)) {
        return this.resolveNode(node.type())
      } else if (this.isComponentNode(node)) {
        console.warn(`Using components in the <Head> component is not supported.`)
        return []
      } else if (this.isTextNode(node) && node.children) {
        return node
      } else if (this.isFragmentNode(node) && node.children) {
        return node.children.flatMap((child) => this.resolveNode(child))
      } else if (this.isCommentNode(node)) {
        return []
      } else {
        return node
      }
    },
  },
  render() {
    this.provider.update(this.renderNodes(this.$slots.default ? this.$slots.default() : []))
  },
})

export default Head
