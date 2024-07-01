<template>
  <div>
    <span class="text">This is the Test App Entrypoint page</span>

    <inertia-link href="/links/method" class="links-method">Basic inertia-links</inertia-link>
    <inertia-link href="/links/replace" class="links-replace">'Replace' inertia-links</inertia-link>

    <span @click="visitsMethod" class="visits-method">Manual basic visits</span>
    <span @click="visitsReplace" class="visits-replace">Manual 'Replace' visits</span>

    <inertia-link href="/redirect" method="post" class="links-redirect">Redirect Link</inertia-link>
    <span @click="redirect" class="visits-redirect">Manual Redirect visit</span>

    <inertia-link href="/redirect-external" method="post" class="links-redirect-external">Redirect Link</inertia-link>
    <span @click="redirectExternal" class="visits-redirect-external">Manual External Redirect visit</span>
  </div>
</template>
<script>
export default {
  methods: {
    visitsMethod() {
      this.$inertia.visit('/visits/method')
    },
    visitsReplace() {
      this.$inertia.get('/visits/replace')
    },
    redirect() {
      this.$inertia.post('/redirect')
    },
    redirectExternal() {
      this.$inertia.post('/redirect-external')
    },
  },
}
</script>
