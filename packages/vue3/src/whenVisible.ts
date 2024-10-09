import { ReloadOptions, router } from '@inertiajs/core'
import { defineComponent, h, PropType } from 'vue'

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
      observer: null,
    }
  },
  unmounted() {
    this.observer?.disconnect()
  },
  mounted() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (!this.$props.always) {
          this.observer.disconnect()
        }

        if (this.fetching) {
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
          },
        })
      },
      {
        rootMargin: `${this.$props.buffer}px`,
      },
    )

    this.observer.observe(this.$el.nextSibling)
  },
  methods: {
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

    if (this.loaded) {
      els.push(this.$slots.default())
    } else {
      els.push(this.$slots.fallback ? this.$slots.fallback() : null)
    }

    return els
  },
})
