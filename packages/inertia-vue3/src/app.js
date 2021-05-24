import useForm from './useForm'
import head from './head'
import link from './link'
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

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    resolveComponent: {
      type: Function,
      required: true,
    },
    resolveErrors: {
      type: Function,
      required: false,
    },
    transformProps: {
      type: Function,
      required: false,
    },
  },
  setup({ initialPage, resolveComponent, transformProps, resolveErrors }) {
    pageComponent.value = markRaw(resolveComponent(initialPage.component))
    pageKey.value = null
    page.value = initialPage

    if (!(typeof window === 'undefined')) {
      Inertia.init({
        initialPage,
        resolveComponent,
        resolveErrors,
        transformProps,
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
      if (pageComponent.value.inheritAttrs === undefined) {
        pageComponent.value.inheritAttrs = false
      }
      return h(pageComponent.value, {
        ...page.value.props,
        dialog: false,
        key: pageKey.value,
      })
    }

    function renderLayout(page) {
      if (typeof pageComponent.value.layout === 'function') {
        return pageComponent.value.layout(h, page)
      } else if (Array.isArray(pageComponent.value.layout)) {
        return pageComponent.value.layout
          .concat(page)
          .reverse()
          .reduce((child, layout) => h(layout, { ...page.value.props }, () => child))
      }

      return [
        h(pageComponent.value.layout, { ...page.value.props }, () => page),
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
    const isServer = typeof window === 'undefined'
    const headManager = createHeadManager(isServer)

    Inertia.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })
    Object.defineProperty(app.config.globalProperties, '$dialog', { get: () => dialog.value })
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    if (isServer) {
      const state = { head: [] }
      Object.defineProperty(app.config.globalProperties, '$head', { get: () => state.head })
      headManager.onUpdate(elements => (state.head = elements))
    }

    app.mixin(remember)
    app.component('InertiaHead', head)
    app.component('InertiaLink', link)
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
