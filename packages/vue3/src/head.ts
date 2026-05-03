import { defineComponent, DefineComponent, onBeforeUnmount, VNode } from 'vue'
import { headManager } from './app'

export type InertiaHead = DefineComponent<{
  title?: string
}>

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

function renderTagChildren(node: VNode): string {
  const { children } = node

  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.reduce<string>((text, child) => {
      const resolved = resolveNode(child as VNode)
      if (Array.isArray(resolved)) {
        return text + resolved.map((c) => (isTextNode(c) ? String(c.children) : '')).join('')
      } else if (isTextNode(resolved)) {
        return text + String(resolved.children)
      } else if (typeof child === 'string' || typeof child === 'number') {
        return text + String(child)
      }
      return text
    }, '')
  }

  return ''
}

function mapNodesToUnhead(nodes: VNode[], title?: string): Record<string, any> {
  const elements = nodes.flatMap((node) => resolveNode(node))
  const unheadObj: Record<string, any> = {
    meta: [],
    link: [],
    style: [],
    script: [],
    noscript: [],
  }

  if (title) {
    unheadObj.title = title
    unheadObj.titleAttr = { 'data-inertia': '' }
  }

  elements.forEach((node) => {
    if (isTextNode(node) || isFragmentNode(node) || isCommentNode(node)) return

    const tag = String(node.type).toLowerCase()
    const props = { ...(node.props || {}) }

    if (props['head-key'] !== undefined) {
      props.key = props['head-key']
      delete props['head-key']
    }

    props['data-inertia'] = props.key !== undefined ? props.key : ''

    const children = node.children ? renderTagChildren(node) : undefined
    if (children !== undefined && children !== '') {
      if (tag === 'title') {
        unheadObj.title = children
        unheadObj.titleAttr = { 'data-inertia': props['data-inertia'] }
        return
      } else {
        props.innerHTML = children
      }
    }

    if (tag === 'title') {
      if (!unheadObj.title && props.innerHTML) {
        unheadObj.title = props.innerHTML
        unheadObj.titleAttr = { 'data-inertia': props['data-inertia'] }
      }
      return
    }

    if (tag === 'base') {
      unheadObj.base = props
    } else if (['meta', 'link', 'style', 'script', 'noscript', 'htmlattrs', 'bodyattrs'].includes(tag)) {
      const key = tag === 'htmlattrs' ? 'htmlAttrs' : tag === 'bodyattrs' ? 'bodyAttrs' : tag
      if (!unheadObj[key]) unheadObj[key] = []
      unheadObj[key].push(props)
    }
  })

  return unheadObj
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
      provider.update(mapNodesToUnhead(slots.default ? slots.default() : [], props.title))
    }
  },
})

export default Head
