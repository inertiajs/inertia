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
  beforeDestroy() {
    this.provider.disconnect()
  },
  methods: {
    isUnaryTag(node) {
      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(node.tag) > -1
    },
    renderTagStart(node) {
      this.ensureNodeHasAttrs(node)
      const attrs = Object.keys(node.data.attrs).reduce((carry, name) => {
        const value = node.data.attrs[name]
        if (name === 'head-key') {
          return carry
        } else if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${value}"`
        }
      }, '')
      return `<${node.tag}${attrs}>`
    },
    renderTagChildren(node) {
      return node.children.reduce((html, child) => html + this.renderTag(child), '')
    },
    renderTag(node) {
      if (!node.tag) {
        return node.text
      }
      let html = this.renderTagStart(node)
      if (node.children) {
        html += this.renderTagChildren(node)
      }
      if (!this.isUnaryTag(node)) {
        html += `</${node.tag}>`
      }
      return html
    },
    ensureNodeHasAttrs(node) {
      node.data = {
        ...(node.data || {}),
        attrs: {
          ...((node.data || {}).attrs || {}),
        },
      }
    },
    ensureNodeHasInertiaAttribute(node) {
      this.ensureNodeHasAttrs(node)
      node.data.attrs['inertia'] = node.data.attrs['head-key'] !== undefined ? node.data.attrs['head-key'] : ''
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
      this.renderNodes(this.$scopedSlots.default ? this.$scopedSlots.default() : [])
    )
  },
}
