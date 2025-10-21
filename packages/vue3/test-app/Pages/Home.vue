<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { getCurrentInstance } from 'vue'

const props = defineProps({
  example: String,
})

const visitsMethod = () => {
  router.visit('/visits/method')
}

const visitsReplace = () => {
  router.get('/visits/replace')
}

const redirect = () => {
  router.post('/redirect')
}

const redirectExternal = () => {
  router.post('/redirect-external')
}

window._inertia_page_key = getCurrentInstance()?.uid
window._inertia_props = props
window._plugin_global_props = getCurrentInstance()?.appContext.config.globalProperties || {}
</script>

<template>
  <Head title="Home" />

  <div>
    <span class="text">This is the Test App Entrypoint page</span>

    <Link href="/links/method" class="links-method">Basic Links</Link>
    <Link href="/links/replace" class="links-replace">'Replace' Links</Link>
    <Link href="/links/as-component" class="links-as-component">Custom Component</Link>

    <a href="#" @click="visitsMethod" class="visits-method">Manual basic visits</a>
    <a href="#" @click="visitsReplace" class="visits-replace">Manual 'Replace' visits</a>

    <Link href="/redirect" method="post" class="links-redirect">Internal Redirect Link</Link>
    <a href="#" @click="redirect" class="visits-redirect">Manual Redirect visit</a>

    <Link href="/redirect-external" method="post" class="links-redirect-external">External Redirect Link</Link>
    <a href="#" @click="redirectExternal" class="visits-redirect-external">Manual External Redirect visit</a>

    <Link id="navigate-back" href="/head/mixed">Go to Mixed Head</Link>
  </div>
</template>
