import { defineComponent, inject, InjectionKey, onBeforeUnmount, VNode } from 'vue'
import { HeadManager } from '@inertiajs/inertia'

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
      return [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'keygen', 'link', 'meta', 'param', 'source',
        'track', 'wbr',
      ].indexOf(node.type as string) > -1
    }

    function renderTagStart(node: VNode) {
      node.props = node.props || {}
      node.props.inertia = node.props['head-key'] !== undefined ? node.props['head-key'] : ''
      const attrs = Object.keys(node.props).reduce((carry, name) => {
        const value = node.props?.[name]
        if (['key', 'head-key'].includes(name)) {
          return carry
        } else if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${value}"`
        }
      }, '')
      return `<${node.type as string}${attrs}>`
    }

    function renderTagChildren(node: VNode) {
      return typeof node.children === 'string'
        ? node.children
        : (node.children as VNode[]).reduce((html, child) => html + renderTag(child), '')
    }

    function renderTag(node: VNode) {
      if (node.type.toString() === 'Symbol(Text)') {
        return node.children as string
      } else if (node.type.toString() === 'Symbol()') {
        return ''
      } else if (node.type.toString() === 'Symbol(Comment)') {
        return ''
      }
      let html = renderTagStart(node)
      if (node.children) {
        html += renderTagChildren(node)
      }
      if (!isUnaryTag(node)) {
        html += `</${node.type as string}>`
      }
      return html
    }

    function addTitleElement(elements: string[]) {
      if (props.title && !elements.find(tag => tag.startsWith('<title'))) {
        elements.push(`<title inertia>${props.title}</title>`)
      }
      return elements
    }

    function renderNodes(nodes: VNode[]) {
      return addTitleElement(
        nodes
          .flatMap(node => node.type.toString() === 'Symbol(Fragment)' ? node.children : node)
          .map(node => renderTag(node as VNode))
          .filter(node => node)
      )
    }

    return () => {
      provider.update(
        renderNodes(slots.default ? slots.default() : [])
      )
    }
  },
})

export function useHeadManager(): HeadManager | undefined {
  return inject(HeadManagerKey)
}
