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
      type: [String, Boolean] as PropType<string | false>,
      default: undefined,
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
    const elToObserve = this.$el.nextElementSibling

    if (!elToObserve) {
      throw new Error('No element found to observe. Please provide a `fallback` slot.')
    }

    this.observer.observe(elToObserve)
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
    getAs() {
      // If they haven't specified, try to gracefully fallback to a div if there's no fallback slot
      return this.$props.as ?? (this.$slots.fallback ? false : 'div')
    },
  },
  render() {
    const els = []
    const as = this.getAs()

    if ((this.$props.always || !this.loaded) && as) {
      els.push(h(as))
    }

    if (this.loaded) {
      els.push(this.$slots.default())
    } else {
      els.push(this.$slots.fallback ? this.$slots.fallback() : null)
    }

    return els
  },
})
