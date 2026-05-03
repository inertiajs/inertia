import { config, HeadManager, HeadManagerOnUpdateCallback, HeadManagerTitleCallback } from '.'
import { createHead as createHeadClient } from 'unhead/client'
import { createHead as createHeadServer, renderSSRHead } from 'unhead/server'

export default function createHeadManager(
  isServer: boolean,
  titleCallback: HeadManagerTitleCallback,
  onUpdate?: HeadManagerOnUpdateCallback,
): HeadManager {
  const unheadOptions = config.get('unhead')
  const head = isServer ? createHeadServer(unheadOptions as any) : createHeadClient(unheadOptions as any)

  if (!isServer) {
    const originalTitle = document.querySelector('title')
    if (originalTitle && !originalTitle.hasAttribute('data-inertia')) {
      originalTitle.setAttribute('data-inertia', '')
    }
  }

  head.use({
    key: 'inertia-unhead-compat',
    hooks: {
      'tags:resolve': (ctx: any) => {
        for (const tag of ctx.tags) {
          if (!tag.props) tag.props = {}
          if (tag.props['data-inertia'] === undefined) {
            tag.props['data-inertia'] = ''
          }
          if (tag.tag === 'title') {
            tag.tagPriority = 100
            if (tag.textContent && titleCallback) {
              tag.textContent = titleCallback(tag.textContent)
            }
          }
        }
      },
    },
  })

  return {
    forceUpdate: () => {},
    renderSSR: async () => {
      if (!isServer) return []
      const { headTags } = await renderSSRHead(head)
      return [headTags]
    },
    createProvider: function () {
      let entry: any = null

      return {
        reconnect: () => {},
        update: (elements: any) => {
          if (entry) {
            entry.patch(elements)
          } else {
            entry = head.push(elements)
          }

          if (isServer && onUpdate) {
            onUpdate(elements)
          }
        },
        disconnect: () => {
          if (entry) {
            entry.dispose()
            entry = null
          }
        },
      }
    },
  }
}
