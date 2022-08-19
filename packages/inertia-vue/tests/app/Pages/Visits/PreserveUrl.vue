<template>
  <div>
    <span @click="preserve" class="preserve">Preserve Url</span>
  </div>
</template>
<script>
export default {
  methods: {
    preserve() {
      this.$inertia.get('/visits/preserve-url?page=2', {}, {
        preserveUrl: true,
      })
    },
  }
}
</script>
