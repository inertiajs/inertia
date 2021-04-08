<script>
import { MetaManager } from '@inertiajs/inertia'

export default {
  data: () => ({
    id: null,
  }),
  created() {
    if (! this.$isServer) {
      this.id = MetaManager.connect()
    }
  },
  beforeDestroy() {
    if (! this.$isServer) {
      MetaManager.disconnect(this.id)
    }
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
    injectVNodeInertiaAttribute(vnode, value, force) {
      this.ensureVnodeAttrs(vnode)
      value = value || ''
      vnode.data.attrs['inertia'] = force ? value : (vnode.data.attrs.inertia || value)
      return vnode
    },
    injectVNodeInertiaSSRAttribute(vnode) {
      return this.injectVNodeInertiaAttribute(vnode, 'ssr', true)
    },
    renderVNode(vnode) {
      if (this.$isServer) {
        this.injectVNodeInertiaSSRAttribute(vnode)
        return this.renderFullTag(vnode)
      } else {
        this.injectVNodeInertiaAttribute(vnode)
        const template = document.createElement('template')
        template.innerHTML = this.renderFullTag(vnode)
        return template.content.firstChild
      }
    },
    renderVNodes(vnodes) {
      const elements = vnodes.map(vnode => this.renderVNode(vnode))
      return this.$isServer
          ? elements.filter(element => element.indexOf('<') > -1)
          : elements
    },
  },
  // eslint-disable-next-line vue/require-render-return
  render() {
    const elements = this.renderVNodes(this.$scopedSlots.default())
    if (this.$isServer) {
      this.$ssrContext.head.push(... elements)
    } else {
      MetaManager.update(this.id, elements)
    }
  },
}
</script>
