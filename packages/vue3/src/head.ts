import { escape } from 'lodash-es'
import { defineComponent, DefineComponent, VNode } from 'vue'

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
    isUnaryTag(node: VNode) {
      return (
        typeof node.type === 'string' &&
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
    renderTagStart(node: VNode) {
      node.props = node.props || {}
      node.props[this.provider.preferredAttribute()] =
        node.props['head-key'] !== undefined ? node.props['head-key'] : ''

      const attrs = Object.keys(node.props).reduce((carry, name) => {
        const value = String(node.props![name])
        if (['key', 'head-key'].includes(name)) {
          return carry
        } else if (value === '') {
          return carry + ` ${name}`
        } else {
          return carry + ` ${name}="${escape(value)}"`
        }
      }, '')

      return `<${String(node.type)}${attrs}>`
    },
    renderTagChildren(node: VNode): string {
      const { children } = node

      if (typeof children === 'string') {
        return children
      }

      if (Array.isArray(children)) {
        return children.reduce<string>((html, child) => {
          return html + this.renderTag(child as VNode)
        }, '')
      }

      return ''
    },
    isFunctionNode(node: VNode): node is VNode & { type: () => VNode } {
      return typeof node.type === 'function'
    },
    isComponentNode(node: VNode): node is VNode & { type: object } {
      return typeof node.type === 'object'
    },
    isCommentNode(node: VNode) {
      return /(comment|cmt)/i.test(node.type.toString())
    },
    isFragmentNode(node: VNode) {
      return /(fragment|fgt|symbol\(\))/i.test(node.type.toString())
    },
    isTextNode(node: VNode) {
      return /(text|txt)/i.test(node.type.toString())
    },
    renderTag(node: VNode): string {
      if (this.isTextNode(node)) {
        return String(node.children)
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
        html += `</${String(node.type)}>`
      }

      return html
    },
    addTitleElement(elements: string[]) {
      if (this.title && !elements.find((tag) => tag.startsWith('<title'))) {
        elements.push(`<title ${this.provider.preferredAttribute()}>${this.title}</title>`)
      }

      return elements
    },
    renderNodes(nodes: VNode[]) {
      const elements = nodes
        .flatMap((node) => this.resolveNode(node))
        .map((node) => this.renderTag(node))
        .filter((node) => node)

      return this.addTitleElement(elements)
    },
    resolveNode(node: VNode): VNode | VNode[] {
      if (this.isFunctionNode(node)) {
        return this.resolveNode(node.type())
      } else if (this.isComponentNode(node)) {
        console.warn(`Using components in the <Head> component is not supported.`)
        return []
      } else if (this.isTextNode(node) && node.children) {
        return node
      } else if (this.isFragmentNode(node) && node.children) {
        return (node.children as VNode[]).flatMap((child) => this.resolveNode(child))
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
