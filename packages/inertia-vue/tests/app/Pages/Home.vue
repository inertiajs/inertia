<template>
  <div>
    <span class="text">This is the Test App Entrypoint page</span>

    <inertia-link href="/links/method" class="links-method">Basic inertia-links</inertia-link>
    <inertia-link href="/links/replace" class="links-replace">'Replace' inertia-links</inertia-link>

    <span @click="visitsMethod" class="visits-method">Manual basic visits</span>
    <span @click="visitsReplace" class="visits-replace">Manual 'Replace' visits</span>
  </div>
</template>
<script>
export default {
  methods: {
    visitsMethod() {
      this.$inertia.visit('/visits/method');
    },
    visitsReplace() {
      this.$inertia.get('/visits/replace');
    }
  }
}
</script>
