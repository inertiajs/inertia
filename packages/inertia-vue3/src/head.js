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
    isUnaryTag(node) {
      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(node.type) > -1
    },
    renderTagStart(node) {
      this.ensureNodeHasProps(node)
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
    renderTag(node) {
      if (node.type.toString() === 'Symbol(Fragment)') {
        return this.renderTagChildren(node)
      } else if (node.type.toString() === 'Symbol(Text)') {
        return node.children
      } else if (node.type.toString() === 'Symbol(Comment)') {
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
    ensureNodeHasProps(node) {
      node.props = node.props || {}
    },
    ensureNodeHasInertiaAttribute(node) {
      this.ensureNodeHasProps(node)
      node.props.inertia = node.props['head-key'] !== undefined ? node.props['head-key'] : ''
      return node
    },
    renderNode(node) {
      this.ensureNodeHasInertiaAttribute(node)
      return this.renderTag(node)
    },
    renderNodes(nodes) {
      const computed = nodes.map(node => this.renderNode(node)).filter(node => node)
      if (this.title && !computed.find(tag => tag.startsWith('<title'))) {
        computed.push(`<title inertia>${this.title}</title>`)
      }
      return computed
    },
  },
  render() {
    this.provider.update(
      this.renderNodes(this.$slots.default ? this.$slots.default() : [])
    )
  },
}
