import { ReloadOptions, router } from '@inertiajs/core'
import { get } from 'lodash-es'
import { defineComponent, h, nextTick, onUnmounted, PropType, ref, SlotsType, watch } from 'vue'
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
    let observer: IntersectionObserver | null = null
    const sentinelRef = ref<HTMLElement | null>(null)

    const page = usePage()

    const keys = (): string[] => {
      return props.data ? ((Array.isArray(props.data) ? props.data : [props.data]) as string[]) : []
    }

    const getReloadParams = (): Partial<ReloadOptions> => {
      const reloadParams: Partial<ReloadOptions> = { preserveErrors: true, ...props.params }

      if (props.data) {
        reloadParams.only = (Array.isArray(props.data) ? props.data : [props.data]) as string[]
      }

      return reloadParams
    }

    const registerObserver = () => {
      observer?.disconnect()

      observer = new IntersectionObserver(
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
                observer?.disconnect()
              }
            },
          })
        },
        {
          rootMargin: `${props.buffer}px`,
        },
      )

      if (sentinelRef.value) {
        observer.observe(sentinelRef.value)
      }
    }

    watch(
      () => keys().map((key) => get(page.props, key)),
      () => {
        const currentKeys = keys()
        const exists = currentKeys.length > 0 && currentKeys.every((key) => get(page.props, key) !== undefined)
        loaded.value = exists

        if (exists && !props.always) {
          return
        }

        if (!observer || !exists) {
          nextTick(registerObserver)
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      observer?.disconnect()
    })

    return () => {
      const els = []

      if (props.always || !loaded.value) {
        els.push(h(props.as, { ref: sentinelRef }))
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
