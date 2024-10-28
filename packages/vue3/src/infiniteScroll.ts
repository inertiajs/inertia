import { InfiniteScrollProp, ReloadOptions, router } from '@inertiajs/core'
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
    autoScroll: {
      type: Boolean as PropType<boolean | number>,
      default: false,
    },
    preserveUrl: {
      type: Boolean,
      default: false,
    },
    manualAfter: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showTrigger: false,
      lastStartData: null,
      lastEndData: null,
      initialData: this.$page.props[this.prop],
      pageNumberObserver: null,
      requestCount: 0,
      fetching: false,
    }
  },
  computed: {
    loadedData(): InfiniteScrollProp<any> {
      return this.$page.props[this.prop] as InfiniteScrollProp<any>
    },
  },
  mounted() {
    if (!this.$props.preserveUrl) {
      this.pageNumberObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const params = new URLSearchParams(window.location.search)
            const pageNumber = entry.target.getAttribute('data-page-number')
            const pageName = this.loadedData.page_name

            router.replace({
              ...Object.fromEntries(params.entries()),
              [pageName]: pageNumber,
            })
          }
        })
      })

      this.tagLastElementWithPageNumber(this.loadedData.current_page)
    }

    if (this.$props.autoScroll !== false) {
      setTimeout(() => {
        const scrollableParent = this.getClosestScrollableParent(this.$el)

        const scrollPercentage = (typeof this.$props.autoScroll === 'boolean' ? 100 : this.$props.autoScroll) / 100

        if (this.$props.trigger === 'start') {
          if (scrollableParent) {
            scrollableParent.scrollTop = scrollableParent.scrollHeight * scrollPercentage
          } else {
            window.scrollTo(0, document.body.scrollHeight * scrollPercentage)
          }
        }
      }, 10)
    }
  },
  unmounted() {
    this.pageNumberObserver?.disconnect()
  },
  methods: {
    getWhenVisibleComponent(params: ReloadOptions, position: 'start' | 'end') {
      const manualMode = this.$props.manualAfter > 0 && this.requestCount >= this.$props.manualAfter

      if (manualMode) {
        return this.$slots.manual({
          fetch: () =>
            router.reload({
              only: [this.$props.prop, this.loadedData.page_name],
              preserveUrl: true,
              ...params,
              onStart: (e) => {
                this.fetching = true
                params?.onStart(e)
              },
              onFinish: (e) => {
                this.fetching = false
                if (position === 'start') {
                  this.lastStartData = this.loadedData
                  this.tagFirstElementWithPageNumber(this.loadedData.previous_page)
                } else {
                  this.lastEndData = this.loadedData
                  this.tagLastElementWithPageNumber(this.loadedData.next_page)
                }
                params?.onFinish(e)
              },
            }),
          fetching: this.fetching,
          position,
        })
      }

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
          this.tagFirstElementWithPageNumber(lastData.previous_page)
          const newScrollHeight = scrollableParent ? scrollableParent.scrollHeight : document.body.scrollHeight
          const diff = newScrollHeight - currentTopElement

          if (scrollableParent) {
            scrollableParent.scrollTop += diff
          } else {
            window.scrollTo(0, window.scrollY + diff)
          }

          this.requestCount++
        },
      }

      if (this.$props.trigger === 'both') {
        if (!lastData.has_previous) {
          return null
        }

        return this.getWhenVisibleComponent(
          {
            data: {
              [lastData.page_name]: lastData.previous_page,
            },
            ...events,
          },
          'start',
        )
      }

      if (!lastData.has_next) {
        return null
      }

      return this.getWhenVisibleComponent(
        {
          data: {
            [lastData.page_name]: lastData.next_page,
          },
          ...events,
        },
        'start',
      )
    },
    getEndWhenVisibleComponent() {
      if (this.$props.trigger === 'start' || !this.showTrigger || !this.loadedData.has_next) {
        return null
      }

      const lastData: InfiniteScrollProp<any> = this.lastEndData ?? this.initialData

      return this.getWhenVisibleComponent(
        {
          data: {
            [lastData.page_name]: lastData.next_page,
          },
          onStart: () => {},
          onFinish: () => {
            this.lastEndData = this.loadedData
            this.tagLastElementWithPageNumber(lastData.next_page)
            this.requestCount++
          },
        },
        'end',
      )
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
    tagLastElementWithPageNumber(pageNumber) {
      if (this.$props.preserveUrl) {
        return
      }

      const fetchingElsCount = this.lastEndData?.has_next ? this.$slots.fetching().length : 0

      let lastEl = this.$el.nextElementSibling
      let foundSibling = !!lastEl

      while (foundSibling) {
        if (lastEl.nextElementSibling) {
          lastEl = lastEl.nextElementSibling
        } else {
          foundSibling = false
        }
      }

      const halfPerPage = Math.floor(this.$page.props[this.prop].per_page / 2)

      for (let i = 0; i < fetchingElsCount; i++) {
        lastEl = lastEl?.previousElementSibling
      }

      for (let i = 0; i < halfPerPage; i++) {
        lastEl = lastEl?.previousElementSibling
      }

      if (lastEl) {
        lastEl.setAttribute('data-page-number', pageNumber)
        this.pageNumberObserver?.observe(lastEl)
      }
    },
    tagFirstElementWithPageNumber(pageNumber) {
      if (this.$props.preserveUrl) {
        return
      }

      // TODO: Correct this, would love to use refs instead
      const fetchingElsCount = 1 // this.lastEndData?.has_previous ? this.$slots.fetching().length : 0

      let firstEl = this.$el.nextElementSibling
      let foundSibling = !!firstEl

      if (!foundSibling) {
        return
      }

      const halfPerPage = Math.floor(this.$page.props[this.prop].per_page / 2)

      for (let i = 0; i < fetchingElsCount; i++) {
        firstEl = firstEl?.nextElementSibling
      }

      for (let i = 0; i < halfPerPage; i++) {
        firstEl = firstEl?.nextElementSibling
      }

      if (firstEl) {
        firstEl.setAttribute('data-page-number', pageNumber)
        this.pageNumberObserver?.observe(firstEl)
      }
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
