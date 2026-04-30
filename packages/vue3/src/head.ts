import { escape } from 'es-toolkit/compat'
import { defineComponent, DefineComponent, onBeforeUnmount, VNode } from 'vue'
import { headManager } from './app'

export type InertiaHead = DefineComponent<{
  title?: string
}>

function isUnaryTag(node: VNode): boolean {
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

function addTitleElement(elements: string[], title?: string): string[] {
  if (title && !elements.find((tag) => tag.startsWith('<title'))) {
    elements.push(`<title data-inertia="">${escape(title)}</title>`)
  }

  return elements
}

function renderNodes(nodes: VNode[], title?: string): string[] {
  const elements = nodes
    .flatMap((node) => resolveNode(node))
    .map((node) => renderTag(node))
    .filter((node) => node)

  return addTitleElement(elements, title)
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

const Head: InertiaHead = defineComponent({
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots }) {
    const provider = headManager.createProvider()

    onBeforeUnmount(() => {
      provider.disconnect()
    })

    return () => {
      provider.update(renderNodes(slots.default ? slots.default() : [], props.title))
    }
  },
})

export default Head
