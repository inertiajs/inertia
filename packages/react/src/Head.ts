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

  function renderTagChildren(node: ReactElement<any>): string {
    const { children } = node.props

    if (typeof children === 'string') return children
    if (typeof children === 'number') return String(children)

    if (Array.isArray(children)) {
      return children.reduce<string>((text, child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return text + String(child)
        }
        return text
      }, '')
    }

    return ''
  }

  function mapNodesToUnhead(nodes: ReactNode, title?: string): Record<string, any> {
    const elements = React.Children.toArray(nodes).filter((node) => node) as ReactElement<any>[]
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
      const tag = typeof node.type === 'string' ? node.type.toLowerCase() : ''
      if (!tag) return

      const props = { ...(node.props || {}) }
      delete props.children

      if (props['head-key'] !== undefined) {
        props.key = props['head-key']
        delete props['head-key']
      }

      props['data-inertia'] = props.key !== undefined ? props.key : ''

      let innerHTML = ''
      if (node.props.dangerouslySetInnerHTML) {
        innerHTML = node.props.dangerouslySetInnerHTML.__html
        delete props.dangerouslySetInnerHTML
      } else if (node.props.children) {
        innerHTML = renderTagChildren(node)
      }

      if (innerHTML !== '') {
        if (tag === 'title') {
          unheadObj.title = innerHTML
          unheadObj.titleAttr = { 'data-inertia': props['data-inertia'] }
          return
        } else {
          props.innerHTML = innerHTML
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

  useEffect(() => {
    provider.reconnect()
    provider.update(mapNodesToUnhead(children, title))
    return () => {
      provider.disconnect()
    }
  }, [provider, children, title])

  if (isServer) {
    provider.update(mapNodesToUnhead(children, title))
  }

  return null
}

export default Head
