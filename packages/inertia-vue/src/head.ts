import { VNode, VNodeData } from 'vue'
import { defineComponent, inject, InjectionKey, onBeforeUnmount } from '@vue/composition-api'
import { ScopedSlotChildren } from 'vue/types/vnode'
import { HeadManager } from '@inertiajs/inertia'

interface VNodeWithEnsuredDataAttrs extends VNode {
  data: VNodeData & {
    attrs: Exclude<VNodeData['attrs'], undefined>
  }
}

export const HeadManagerKey = Symbol() as InjectionKey<HeadManager>

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots }) {
    const headManager = useHeadManager()
    if (!headManager) {
      return
    }

    const provider = headManager.createProvider()

    onBeforeUnmount(() => {
      provider.disconnect()
    })

    function isUnaryTag(node: VNode) {
      if (node.tag === undefined) {
        return false
      }

      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(node.tag) > -1
    }

    function renderTagStart(_node: VNode) {
      const node: VNodeWithEnsuredDataAttrs = ensureNodeHasAttrs(_node)
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
    }

    function renderTagChildren(node: VNode) {
      return (node.children || []).reduce((html, child) => html + renderTag(child), '')
    }

    function renderTag(node: VNode) {
      if (!node.tag) {
        return node.text
      }
      let html = renderTagStart(node)
      if (node.children) {
        html += renderTagChildren(node)
      }
      if (!isUnaryTag(node)) {
        html += `</${node.tag}>`
      }
      return html
    }

    function ensureNodeHasAttrs(node: VNode) {
      node.data = {
        ...(node.data || {}),
        attrs: <VNodeData['attrs']> {
          ...((node.data || {}).attrs || {}),
        },
      }

      return node as VNodeWithEnsuredDataAttrs
    }

    function ensureNodeHasInertiaAttribute(_node: VNode) {
      const node = ensureNodeHasAttrs(_node)
      node.data.attrs['inertia'] = node.data.attrs['head-key'] !== undefined ? node.data.attrs['head-key'] : ''
      return node
    }

    function renderNode(node: VNode) {
      ensureNodeHasInertiaAttribute(node)
      return renderTag(node)
    }

    function renderNodes(nodes: ScopedSlotChildren) {
      if (!nodes) {
        return []
      }

      const computed = nodes.map(node => renderNode(node)).filter(node => node) as string[]
      if (props.title && !computed.find(tag => tag.startsWith('<title'))) {
        computed.push(`<title inertia>${props.title}</title>`)
      }
      return computed
    }

    return () => {
      provider.update(
        renderNodes(slots.default ? slots.default() : []),
      )
    }
  },
})

export function useHeadManager(): HeadManager | undefined {
  return inject(HeadManagerKey)
}
