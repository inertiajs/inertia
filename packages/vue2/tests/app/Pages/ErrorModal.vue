<template>
  <div>
    <span @click="invalidVisit" class="invalid-visit">Invalid Visit</span>
    <span @click="invalidVisitJson" class="invalid-visit-json">Invalid Visit (JSON response)</span>
  </div>
</template>
<script>
export default {
  methods: {
    invalidVisit() {
      this.$inertia.post('/non-inertia')
    },
    invalidVisitJson() {
      this.$inertia.post('/json')
    },
  },
}
</script>
