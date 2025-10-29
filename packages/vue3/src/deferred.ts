import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Deferred',
  props: {
    data: {
      type: [String, Array<String>],
      required: true,
    },
  },
  render() {
    const keys = (Array.isArray(this.$props.data) ? this.$props.data : [this.$props.data]) as string[]
    const loaded = keys.every((key) => this.$page.props[key] !== undefined)

    if (! loaded && this.$slots.fallback) {
      return this.$slots.fallback()
    }

    return this.$slots.default?.({ loading: !loaded })
  },
})
