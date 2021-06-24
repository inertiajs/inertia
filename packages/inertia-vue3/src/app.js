import useForm from './useForm'
import remember from './remember'
import { computed, h, markRaw, ref, nextTick } from 'vue'
import { createHeadManager, Inertia } from '@inertiajs/inertia'
import cloneDeep from 'lodash.clonedeep'

const page = ref({})
const pageKey = ref(null)
const pageComponent = ref(null)

const dialog = ref({})
const dialogKey = ref(null)
const dialogComponent = ref(null)
let headManager = null

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    initialComponent: {
      type: Object,
      required: false,
    },
    resolveComponent: {
      type: Function,
      required: false,
    },
    titleCallback: {
      type: Function,
      required: false,
      default: title => title,
    },
    onHeadUpdate: {
      type: Function,
      required: false,
      default: () => () => {},
    },
  },
  setup({ initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate }) {
    pageComponent.value = initialComponent ? markRaw(initialComponent) : null
    pageKey.value = null
    page.value = initialPage

    const isServer = typeof window === 'undefined'
    headManager = createHeadManager(isServer, titleCallback, onHeadUpdate)

    if (!isServer) {
      Inertia.init({
        initialPage,
        resolveComponent,
        swapComponent: async (args) => {
          const { dialog: _dialog, ..._page } = args.page

          page.value = _page
          pageKey.value = (args.preserveState || args.dialogComponent) ? pageKey.value : Date.now()
          pageComponent.value = markRaw(args.component)

          if (args.dialogComponent) {
            nextTick(() => {
              function shouldAppear() {
                const newKey = [args.dialogComponent, ...Object.values(args.dialogComponent.components)].find(component => component.dialogKey)?.dialogKey
                const currentKey = [dialogComponent.value || {}, ...Object.values(dialogComponent.value?.components || {})].find(component => component.dialogKey)?.dialogKey

                return !_dialog.eager &&
                    !(dialog.value.open &&
                      (_dialog.component === dialog.value.component || (newKey && currentKey && newKey === currentKey))
                    )
              }

              dialog.value = { ...cloneDeep(_dialog), open: true, appear: shouldAppear() }
              dialogKey.value = (args.preserveState && args.dialogComponent) ? dialogKey.value : Date.now()
              dialogComponent.value = markRaw(args.dialogComponent)
            })
          } else if (dialog.value.open === true) {
            dialog.value.open = false
          }
        },
      })
    }

    function renderPage() {
      pageComponent.value.inheritAttrs = !!pageComponent.value.inheritAttrs

      return h(pageComponent.value, {
        ...page.value.props,
        dialog: false,
        key: pageKey.value,
      })
    }

    function renderLayout(child) {
      if (typeof pageComponent.value.layout === 'function') {
        return pageComponent.value.layout(h, child)
      } else if (Array.isArray(pageComponent.value.layout)) {
        return pageComponent.value.layout
          .concat(child)
          .reverse()
          .reduce((child, layout) => {
            layout.inheritAttrs = !!layout.inheritAttrs
            return h(layout, { ...page.value.props }, () => child)
          })
      }

      return [
        h(pageComponent.value.layout, { ...page.value.props }, () => child),
        renderDialog(),
      ]
    }

    function renderDialog() {
      return dialogComponent.value ? h(dialogComponent.value, {
        ...dialog.value.props,
        key: dialogKey.value,
      }) : null
    }

    return () => {
      if (pageComponent.value) {
        const page = renderPage()

        if (pageComponent.value.layout) {
          return renderLayout(page)
        }

        return [page, renderDialog()]
      }
    }
  },
}

export const plugin = {
  install(app) {
    Inertia.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })
    Object.defineProperty(app.config.globalProperties, '$dialog', { get: () => dialog.value })
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    app.mixin(remember)
  },
}

export function usePage() {
  return {
    props: computed(() => page.value.props),
    url: computed(() => page.value.url),
    component: computed(() => page.value.component),
    version: computed(() => page.value.version),
  }
}
