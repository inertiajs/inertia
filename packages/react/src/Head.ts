import { escape } from 'lodash-es'
import React, { FunctionComponent, ReactElement, ReactNode, use, useEffect, useMemo } from 'react'
import HeadContext from './HeadContext'

type InertiaHeadProps = {
  title?: string
  children?: ReactNode
}

type InertiaHead = FunctionComponent<InertiaHeadProps>

const Head: InertiaHead = function ({ children, title }) {
  const headManager = use(HeadContext)
  const provider = useMemo(() => headManager!.createProvider(), [headManager])
  const isServer = typeof window === 'undefined'

  useEffect(() => {
    provider.reconnect()
    provider.update(renderNodes(children))
    return () => {
      provider.disconnect()
    }
  }, [provider, children, title])

  function isUnaryTag(node: ReactElement<any>) {
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

  function renderTagStart(node: ReactElement<any>): string {
    const attrs = Object.keys(node.props).reduce((carry, name) => {
      if (['head-key', 'children', 'dangerouslySetInnerHTML'].includes(name)) {
        return carry
      }

      const value = String(node.props[name])

      if (value === '') {
        return carry + ` ${name}`
      }

      return carry + ` ${name}="${escape(value)}"`
    }, '')

    return `<${String(node.type)}${attrs}>`
  }

  function renderTagChildren(node: ReactElement<any>): string {
    const { children } = node.props

    if (typeof children === 'string') {
      return children
    }

    if (Array.isArray(children)) {
      return children.reduce((html, child) => html + renderTag(child), '')
    }

    return ''
  }

  function renderTag(node: ReactElement<any>): string {
    let html = renderTagStart(node)

    if (node.props.children) {
      html += renderTagChildren(node)
    }

    if (node.props.dangerouslySetInnerHTML) {
      html += node.props.dangerouslySetInnerHTML.__html
    }

    if (!isUnaryTag(node)) {
      html += `</${String(node.type)}>`
    }

    return html
  }

  function ensureNodeHasInertiaProp(node: ReactElement<any>) {
    return React.cloneElement(node, {
      'data-inertia': node.props['head-key'] !== undefined ? node.props['head-key'] : '',
    })
  }

  function renderNode(node: ReactElement<any>) {
    return renderTag(ensureNodeHasInertiaProp(node))
  }

  function renderNodes(nodes: ReactNode) {
    const elements = React.Children.toArray(nodes)
      .filter((node) => node)
      .map((node) => renderNode(node as ReactElement<any>))

    if (title && !elements.find((tag) => tag.startsWith('<title'))) {
      elements.push(`<title data-inertia="">${title}</title>`)
    }

    return elements
  }

  if (isServer) {
    provider.update(renderNodes(children))
  }

  return null
}
export default Head
