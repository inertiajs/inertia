import { ReloadOptions, router } from '@inertiajs/core'
import { defineComponent, h, PropType } from 'vue'
import { usePage } from './app'

export default defineComponent({
  name: 'WhenVisible',
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
  created() {
    const page = usePage()

    this.$watch(
      () => {
        return Array.isArray(this.data)
          ? this.data.map((data) => page.props[data as string])
          : page.props[this.data as string]
      },
      (value) => {
        if (Array.isArray(this.data)) {
          if (this.data.every((data) => page.props[data as string] !== undefined)) {
            this.loaded = true
            return
          }
        } else if (value !== undefined) {
          this.loaded = true
          return
        }

        this.loaded = false
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
      els.push(this.$slots.fallback ? this.$slots.fallback() : null)
    } else if (this.$slots.default) {
      els.push(this.$slots.default())
    }

    return els
  },
})
