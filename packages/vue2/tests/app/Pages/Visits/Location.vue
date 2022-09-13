<template>
  <div>
    <span class="text">This is the page that demonstrates location visits</span>

    <span @click="locationVisit" class="example">Location visit</span>
  </div>
</template>
<script>
export default {
  methods: {
    locationVisit() {
      this.$inertia.get('/location')
    },
  },
}
</script>
