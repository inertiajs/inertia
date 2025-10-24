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

    if (!this.$slots.fallback) {
      throw new Error('`<Deferred>` requires a `<template #fallback>` slot')
    }

    return keys.every((key) => this.$page.props[key] !== undefined) ? this.$slots.default?.() : this.$slots.fallback()
  },
})
