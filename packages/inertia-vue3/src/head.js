export default {
  data() {
    return {
      provider: this.$headManager.createProvider(),
    }
  },
  beforeUnmount() {
    this.provider.disconnect()
  },
  methods: {
    ensureVnodeProps(vnode) {
      vnode.props = vnode.props || {}
    },
    renderStartTag(vnode) {
      this.ensureVnodeProps(vnode)

      const attrs = Object.keys(vnode.props).reduce((carry, name) => {
        const value = vnode.props[name]
        if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${value}"`
        }
      }, '')

      return `<${vnode.type}${attrs}>`
    },
    renderChildren(vnode) {
      return typeof vnode.children === 'string'
        ? vnode.children
        : vnode.children.reduce((html, child) => html + this.renderFullTag(child), '')
    },
    isUnaryTag(vnode) {
      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(vnode.type) > -1
    },
    renderFullTag(vnode) {
      if (typeof vnode.type === 'symbol') {
        return vnode.children
      }
      let html = this.renderStartTag(vnode)
      if (vnode.children) {
        html += this.renderChildren(vnode)
      }
      if (!this.isUnaryTag(vnode)) {
        html += `</${vnode.type}>`
      }
      return html
    },
    ensureVNodeInertiaAttribute(vnode) {
      this.ensureVnodeProps(vnode)
      vnode.props.inertia = vnode.props.inertia || ''
      return vnode
    },
    renderVNode(vnode) {
      this.ensureVNodeInertiaAttribute(vnode)
      return this.renderFullTag(vnode)
    },
    renderVNodes(vnodes) {
      return vnodes.map(vnode => this.renderVNode(vnode))
    },
  },
  render() {
    if (this.$slots.default) {
      this.provider.update(this.renderVNodes(this.$slots.default()))
    }
  },
}
