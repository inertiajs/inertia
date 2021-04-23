import useForm from './useForm'
import link from './link'
import remember from './remember'
import { computed, h, markRaw, ref } from 'vue'
import { Inertia } from '@inertiajs/inertia'
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
          dialog.value = { ...cloneDeep(_dialog), open: true }
          dialogKey.value = (args.preserveState && args.dialogComponent) ? dialogKey.value : Date.now()
          dialogComponent.value = markRaw(args.dialogComponent)
        } else if (dialog.value.open === true) {
          dialog.value.open = false
        }
      },
    })

    function renderPage() {
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
          .reduce((child, layout) => h(layout, () => child))
      }

      return [
        h(pageComponent.value.layout, () => page),
        renderDialog()
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
    app.mixin(remember)
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
