import { InfiniteScrollProp, ReloadOptions } from '@inertiajs/core'
import { defineComponent, h, PropType } from 'vue'
import whenVisible from './whenVisible'

export default defineComponent({
  name: 'InfiniteScroll',
  props: {
    prop: String,
    buffer: {
      type: Number,
      default: 0,
    },
    trigger: {
      type: String as PropType<'end' | 'start' | 'both'>,
      default: 'end',
    },
  },
  data() {
    return {
      showTrigger: false,
      lastStartData: null,
      lastEndData: null,
      initialData: this.$page.props[this.prop],
    }
  },
  computed: {
    loadedData(): InfiniteScrollProp<any> {
      return this.$page.props[this.prop] as InfiniteScrollProp<any>
    },
  },
  methods: {
    getWhenVisibleComponent(params: ReloadOptions) {
      return h(
        whenVisible,
        {
          always: true,
          buffer: this.$props.buffer,
          params: {
            only: [this.$props.prop, this.loadedData.page_name],
            preserveUrl: true,
            ...params,
          },
        },
        {
          default: () => this.$slots.fetching(),
          fallback: () => this.$slots.fetching(),
        },
      )
    },
    getStartWhenVisibleComponent() {
      if (this.$props.trigger === 'end' || !this.showTrigger) {
        return null
      }

      const scrollableParent = this.getClosestScrollableParent(this.$el)

      const lastData: InfiniteScrollProp<any> = this.lastStartData ?? this.initialData

      let currentTopElement = null

      const events = {
        onStart: () => {
          currentTopElement = scrollableParent ? scrollableParent.scrollHeight : document.body.scrollHeight
        },
        onFinish: () => {
          this.lastStartData = this.loadedData
          const newScrollHeight = scrollableParent ? scrollableParent.scrollHeight : document.body.scrollHeight
          const diff = newScrollHeight - currentTopElement
          if (scrollableParent) {
            scrollableParent.scrollTop += diff
          } else {
            window.scrollTo(0, window.scrollY + diff)
          }
        },
      }

      if (this.$props.trigger === 'both') {
        if (!lastData.has_previous) {
          return null
        }

        return this.getWhenVisibleComponent({
          data: {
            [lastData.page_name]: lastData.previous_page,
          },
          ...events,
        })
      }

      if (!lastData.has_next) {
        return null
      }

      return this.getWhenVisibleComponent({
        data: {
          [lastData.page_name]: lastData.next_page,
        },
        ...events,
      })
    },
    getEndWhenVisibleComponent() {
      if (this.$props.trigger === 'start' || !this.showTrigger || !this.loadedData.has_next) {
        return null
      }

      const lastData: InfiniteScrollProp<any> = this.lastEndData ?? this.initialData

      return this.getWhenVisibleComponent({
        data: {
          [lastData.page_name]: lastData.next_page,
        },
        onFinish: () => {
          this.lastEndData = this.loadedData
        },
      })
    },
    getClosestScrollableParent(element) {
      let parent = element.parentElement

      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY

        if (overflowY === 'auto' || overflowY === 'scroll') {
          return parent
        }

        parent = parent.parentElement
      }

      // No scrollable parent found
      return null
    },
  },
  render() {
    const els = []

    els.push(this.$slots.default())

    const startEl = this.getStartWhenVisibleComponent()
    const endEl = this.getEndWhenVisibleComponent()

    setTimeout(() => {
      this.showTrigger = true
    }, 100)

    if (startEl) {
      els.unshift(startEl)
    }

    if (endEl) {
      els.push(endEl)
    }

    return els
  },
})
