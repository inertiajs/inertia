import { VNode, VNodeData } from 'vue'
import { defineComponent } from '@vue/composition-api'
import { ScopedSlotChildren } from 'vue/types/vnode'

interface VNodeWithEnsuredDataAttrs extends VNode {
  data: VNodeData & {
    attrs: Exclude<VNodeData['attrs'], undefined>
  }
}

export default defineComponent({
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
    isUnaryTag(node: VNode) {
      if (node.tag === undefined) {
        return false
      }

      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(node.tag) > -1
    },
    renderTagStart(_node: VNode) {
      const node: VNodeWithEnsuredDataAttrs = this.ensureNodeHasAttrs(_node)
      const attrs = Object.keys(node.data.attrs).reduce((carry, name) => {
        const value = node.data.attrs[name] || ''
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
    renderTagChildren(node: VNode) {
      return (node.children || []).reduce((html, child) => html + this.renderTag(child), '')
    },
    renderTag(node: VNode) {
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
    ensureNodeHasAttrs(node: VNode): VNodeWithEnsuredDataAttrs {
      node.data = {
        ...(node.data || {}),
        attrs: <VNodeData['attrs']> {
          ...((node.data || {}).attrs || {}),
        },
      }

      return <VNodeWithEnsuredDataAttrs> node
    },
    ensureNodeHasInertiaAttribute(_node: VNode) {
      const node = this.ensureNodeHasAttrs(_node)
      node.data.attrs['inertia'] = node.data.attrs['head-key'] !== undefined ? node.data.attrs['head-key'] : ''
      return node
    },
    renderNode(node: VNode) {
      this.ensureNodeHasInertiaAttribute(node)
      return this.renderTag(node)
    },
    renderNodes(nodes: ScopedSlotChildren) {
      if (!nodes) {
        return []
      }

      const computed = nodes.map(node => this.renderNode(node)).filter(node => node) as string[]
      if (this.title && !computed.find(tag => tag.startsWith('<title'))) {
        computed.push(`<title inertia>${this.title}</title>`)
      }
      return computed
    },
  },
  render(h) {
    this.provider.update(
      this.renderNodes(this.$scopedSlots.default ? this.$scopedSlots.default({}) : []),
    )

    return h('template')
  },
})
