import { ReloadOptions, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { computed, defineComponent, h, nextTick, onUnmounted, PropType, ref, SlotsType, watch } from 'vue'
import { usePage } from './app'

export default defineComponent({
  name: 'WhenVisible',
  slots: Object as SlotsType<{
    default: { fetching: boolean }
    fallback: {}
  }>,
  props: {
    data: {
      type: [String, Array<String>],
    },
    params: {
      type: Object as PropType<ReloadOptions>,
    },
    buffer: {
      type: Number,
      default: 0,
    },
    as: {
      type: String,
      default: 'div',
    },
    always: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const loaded = ref(false)
    const fetching = ref(false)
    const observer = ref<IntersectionObserver | null>(null)
    const elementRef = ref<HTMLElement | null>(null)
    const page = usePage()

    const keys = computed(() => {
      return props.data ? ((Array.isArray(props.data) ? props.data : [props.data]) as string[]) : []
    })

    function getReloadParams(): Partial<ReloadOptions> {
      const reloadParams: Partial<ReloadOptions> = { preserveErrors: true, ...props.params }

      if (props.data) {
        reloadParams.only = (Array.isArray(props.data) ? props.data : [props.data]) as string[]
      }

      return reloadParams
    }

    function registerObserver() {
      observer.value?.disconnect()

      observer.value = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) {
            return
          }

          if (fetching.value) {
            return
          }

          if (!props.always && loaded.value) {
            return
          }

          fetching.value = true

          const reloadParams = getReloadParams()

          router.reload({
            ...reloadParams,
            onStart: (e) => {
              fetching.value = true
              reloadParams.onStart?.(e)
            },
            onFinish: (e) => {
              loaded.value = true
              fetching.value = false
              reloadParams.onFinish?.(e)

              if (!props.always) {
                observer.value?.disconnect()
              }
            },
          })
        },
        {
          rootMargin: `${props.buffer}px`,
        },
      )

      if (elementRef.value) {
        observer.value.observe(elementRef.value)
      }
    }

    watch(
      () => keys.value.map((key) => get(page.props, key)),
      () => {
        const exists = keys.value.length > 0 && keys.value.every((key) => get(page.props, key) !== undefined)
        loaded.value = exists

        if (exists && !props.always) {
          return
        }

        if (!observer.value || !exists) {
          nextTick(registerObserver)
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      observer.value?.disconnect()
    })

    return () => {
      const els = []

      if (props.always || !loaded.value) {
        els.push(h(props.as, { ref: elementRef }))
      }

      if (!loaded.value) {
        els.push(slots.fallback ? slots.fallback({}) : null)
      } else if (slots.default) {
        els.push(slots.default({ fetching: fetching.value }))
      }

      return els
    }
  },
})
