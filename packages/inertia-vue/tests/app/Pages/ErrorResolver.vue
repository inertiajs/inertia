<template>
  <div>
    <span @click="errorVisit" class="visit">Error Visit</span>
  </div>
</template>
<script>
export default {
  methods: {
    errorVisit() {
      this.$inertia.get('/error-resolver', {}, {
        onError: errors => alert(errors)
      })
    }
  }
}
</script>
