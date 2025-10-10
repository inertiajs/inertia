import { escape } from 'lodash-es'
import React, { FunctionComponent, useContext, useEffect, useMemo } from 'react'
import HeadContext from './HeadContext'

type HeadElement = React.ReactElement<React.HTMLAttributes<HTMLElement> & { 'head-key'?: string; inertia?: string }>
type InertiaHead = FunctionComponent<InertiaHeadProps>
type InertiaHeadProps = {
  title?: string
  children?: HeadElement[]
}

const Head: InertiaHead = function ({ children, title }) {
  const headManager = useContext(HeadContext)!
  const provider = useMemo(() => headManager.createProvider(), [headManager])
  const isServer = typeof window === 'undefined'

  useEffect(() => {
    provider.reconnect()
    provider.update(renderNodes(children || []))
    return () => {
      provider.disconnect()
    }
  }, [provider, children, title])

  function isUnaryTag(node: HeadElement): boolean {
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

  function renderTagStart(node: HeadElement): string {
    const props = node.props as Record<string, unknown>
    const attrs = Object.keys(props).reduce((carry, name) => {
      if (['head-key', 'children', 'dangerouslySetInnerHTML'].includes(name)) {
        return carry
      }

      const value = String(props[name])

      if (value === '') {
        return carry + ` ${name}`
      } else {
        return carry + ` ${name}="${escape(value)}"`
      }
    }, '')
    return `<${node.type}${attrs}>`
  }

  function renderTagChildren(node: HeadElement): string {
    const { children } = node.props

    if (typeof children === 'string') {
      return children
    }

    if (Array.isArray(children)) {
      return children.reduce((html: string, child: HeadElement) => html + renderTag(child), '')
    }

    return ''
  }

  function renderTag(node: HeadElement): string {
    let html = renderTagStart(node)

    if (node.props.children) {
      html += renderTagChildren(node)
    }

    if (node.props.dangerouslySetInnerHTML) {
      html += node.props.dangerouslySetInnerHTML.__html
    }

    if (!isUnaryTag(node)) {
      html += `</${node.type}>`
    }

    return html
  }

  function ensureNodeHasInertiaProp(node: HeadElement): HeadElement {
    return React.cloneElement(node, {
      inertia: node.props['head-key'] !== undefined ? node.props['head-key'] : '',
    })
  }

  function renderNode(node: HeadElement): string {
    return renderTag(ensureNodeHasInertiaProp(node))
  }

  function renderNodes(nodes: HeadElement[]): Array<string> {
    const computed = React.Children.toArray(nodes)
      .filter((node) => node)
      .map((node) => renderNode(node as HeadElement))

    if (title && !computed.find((tag) => tag.startsWith('<title'))) {
      computed.push(`<title inertia>${title}</title>`)
    }

    return computed
  }

  if (isServer) {
    provider.update(renderNodes(children || []))
  }

  return null
}
export default Head
