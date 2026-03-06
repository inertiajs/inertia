import { escape } from 'lodash-es'
import { defineComponent, DefineComponent, inject, onBeforeUnmount, VNode } from 'vue'
import headContext from './HeadContext'

export type InertiaHead = DefineComponent<{
  title?: string
}>

const unaryTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']

function isUnaryTag(node: VNode): boolean {
  return typeof node.type === 'string' && unaryTags.indexOf(node.type) > -1
}

function isFunctionNode(node: VNode): node is VNode & { type: () => VNode } {
  return typeof node.type === 'function'
}

function isComponentNode(node: VNode): node is VNode & { type: object } {
  return typeof node.type === 'object'
}

function isCommentNode(node: VNode): boolean {
  return /(comment|cmt)/i.test(node.type.toString())
}

function isFragmentNode(node: VNode): boolean {
  return /(fragment|fgt|symbol\(\))/i.test(node.type.toString())
}

function isTextNode(node: VNode): boolean {
  return /(text|txt)/i.test(node.type.toString())
}

function renderTagStart(node: VNode): string {
  node.props = node.props || {}
  node.props['data-inertia'] = node.props['head-key'] !== undefined ? node.props['head-key'] : ''

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
}

function renderTagChildren(node: VNode): string {
  const { children } = node

  if (typeof children === 'string') {
    return children
  }

  if (Array.isArray(children)) {
    return children.reduce<string>((html, child) => {
      return html + renderTag(child as VNode)
    }, '')
  }

  return ''
}

function renderTag(node: VNode): string {
  if (isTextNode(node)) {
    return String(node.children)
  } else if (isFragmentNode(node)) {
    return ''
  } else if (isCommentNode(node)) {
    return ''
  }

  let html = renderTagStart(node)

  if (node.children) {
    html += renderTagChildren(node)
  }

  if (!isUnaryTag(node)) {
    html += `</${String(node.type)}>`
  }

  return html
}

function resolveNode(node: VNode): VNode | VNode[] {
  if (isFunctionNode(node)) {
    return resolveNode(node.type())
  } else if (isComponentNode(node)) {
    console.warn(`Using components in the <Head> component is not supported.`)
    return []
  } else if (isTextNode(node) && node.children) {
    return node
  } else if (isFragmentNode(node) && node.children) {
    return (node.children as VNode[]).flatMap((child) => resolveNode(child))
  } else if (isCommentNode(node)) {
    return []
  } else {
    return node
  }
}

function renderNodes(title: string | undefined, nodes: VNode[]): string[] {
  const elements = nodes
    .flatMap((node) => resolveNode(node))
    .map((node) => renderTag(node))
    .filter((node) => node)

  if (title && !elements.find((tag) => tag.startsWith('<title'))) {
    elements.push(`<title data-inertia="">${title}</title>`)
  }

  return elements
}

const Head: InertiaHead = defineComponent({
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots }) {
    const headManager = inject(headContext)!
    const provider = headManager.createProvider()

    onBeforeUnmount(() => {
      provider.disconnect()
    })

    return () => {
      provider.update(renderNodes(props.title, slots.default ? slots.default() : []))
    }
  },
})

export default Head
