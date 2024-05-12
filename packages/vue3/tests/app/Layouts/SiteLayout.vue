<template>
  <div>
    <span>Site Layout</span>
    <span>{{ createdAt }}</span>
    <div>
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    createdAt: null,
  }),
  created() {
    this.createdAt = Date.now()
    window._inertia_site_layout_props = this.$.vnode.props
  },
}
</script>
