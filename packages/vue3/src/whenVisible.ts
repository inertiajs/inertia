import { ReloadOptions, router } from '@inertiajs/core'
import { defineComponent, h, PropType, SlotsType } from 'vue'
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
  data() {
    return {
      loaded: false,
      fetching: false,
      observer: null as IntersectionObserver | null,
    }
  },
  unmounted() {
    this.observer?.disconnect()
  },
  computed: {
    keys(): string[] {
      return this.data ? ((Array.isArray(this.data) ? this.data : [this.data]) as string[]) : []
    },
  },
  created() {
    const page = usePage()

    this.$watch(
      () => this.keys.map((key) => page.props[key]),
      () => {
        const exists = this.keys.length > 0 && this.keys.every((key) => page.props[key] !== undefined)
        this.loaded = exists

        if (exists && !this.always) {
          return
        }

        this.$nextTick(this.registerObserver)
      },
      { immediate: true },
    )
  },
  methods: {
    registerObserver() {
      this.observer?.disconnect()

      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) {
            return
          }

          if (this.fetching) {
            return
          }

          if (!this.always && this.loaded) {
            return
          }

          this.fetching = true

          const reloadParams = this.getReloadParams()

          router.reload({
            ...reloadParams,
            onStart: (e) => {
              this.fetching = true
              reloadParams.onStart?.(e)
            },
            onFinish: (e) => {
              this.loaded = true
              this.fetching = false
              reloadParams.onFinish?.(e)

              if (!this.always) {
                this.observer?.disconnect()
              }
            },
          })
        },
        {
          rootMargin: `${this.$props.buffer}px`,
        },
      )

      this.observer.observe(this.$el.nextSibling)
    },
    getReloadParams(): Partial<ReloadOptions> {
      if (this.$props.data) {
        return {
          only: (Array.isArray(this.$props.data) ? this.$props.data : [this.$props.data]) as string[],
        }
      }

      if (!this.$props.params) {
        throw new Error('You must provide either a `data` or `params` prop.')
      }

      return this.$props.params
    },
  },
  render() {
    const els = []

    if (this.$props.always || !this.loaded) {
      els.push(h(this.$props.as))
    }

    if (!this.loaded) {
      els.push(this.$slots.fallback ? this.$slots.fallback({}) : null)
    } else if (this.$slots.default) {
      els.push(this.$slots.default({ fetching: this.fetching }))
    }

    return els
  },
})
