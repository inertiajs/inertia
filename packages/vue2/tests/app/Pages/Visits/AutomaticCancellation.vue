<template>
  <div>
    <span class="text">This is the page that demonstrates that only one visit can be active at a time</span>
    <span @click="visit" class="visit">Link</span>
  </div>
</template>
<script>
export default {
  methods: {
    visit() {
      this.$inertia.get(
        '/sleep',
        {},
        {
          onStart: () => alert('started'),
          onCancel: () => alert('cancelled'),
        },
      )
    },
  },
}
</script>
