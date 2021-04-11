import { Inertia } from '@inertiajs/inertia'

export default {
  data: () => ({
    provider: Inertia.meta.createProvider(),
  }),
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
      return vnodes.map(vnode => this.renderVNode(vnode))
    },
  },
  render() {
    if (this.$scopedSlots.default) {
      this.provider.update(this.renderVNodes(this.$scopedSlots.default()))
    }
  },
}
