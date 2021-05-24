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
    ensureVnodeAttrs(vnode) {
      vnode.data = {
        ...(vnode.data || {}),
        attrs: {
          ...((vnode.data || {}).attrs || {}),
        },
      }
    },
    renderStartTag(vnode) {
      this.ensureVnodeAttrs(vnode)

      const attrs = Object.keys(vnode.data.attrs).reduce((carry, name) => {
        const value = vnode.data.attrs[name]
        if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${value}"`
        }
      }, '')

      return `<${vnode.tag}${attrs}>`
    },
    renderChildren(vnode) {
      return vnode.children.reduce((html, child) => html + this.renderFullTag(child), '')
    },
    isUnaryTag(vnode) {
      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(vnode.tag) > -1
    },
    renderFullTag(vnode) {
      if (!vnode.tag) {
        return vnode.text
      }
      let html = this.renderStartTag(vnode)
      if (vnode.children) {
        html += this.renderChildren(vnode)
      }
      if (!this.isUnaryTag(vnode)) {
        html += `</${vnode.tag}>`
      }
      return html
    },
    ensureVNodeInertiaAttribute(vnode) {
      this.ensureVnodeAttrs(vnode)
      vnode.data.attrs['inertia'] = vnode.data.attrs.inertia || ''
      return vnode
    },
    renderVNode(vnode) {
      this.ensureVNodeInertiaAttribute(vnode)
      return this.renderFullTag(vnode)
    },
    renderVNodes(vnodes) {
      const computed = vnodes.map(vnode => this.renderVNode(vnode))

      if (this.title && !computed.find(tag => tag.startsWith('<title'))) {
        computed.push(`<title inertia>${this.title}</title>`)
      }

      return computed
    },
  },
  render() {
    this.provider.update(
      this.renderVNodes(this.$scopedSlots.default ? this.$scopedSlots.default() : [])
    )
  },
}
