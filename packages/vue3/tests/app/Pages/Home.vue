<script setup>
import { Link, router, usePage } from '@inertiajs/vue3'
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

window._inertia_page_key = getCurrentInstance().uid
window._inertia_props = props
window._plugin_global_props = getCurrentInstance().appContext.config.globalProperties

const page = usePage()
</script>

<template>
  <div>
    <span class="text">This is the Test App Entrypoint page</span>

    <Link href="/links/method" class="links-method">Basic Links</Link>
    <Link href="/links/replace" class="links-replace">'Replace' Links</Link>

    <span @click="visitsMethod" class="visits-method">Manual basic visits</span>
    <span @click="visitsReplace" class="visits-replace">Manual 'Replace' visits</span>

    <Link href="/redirect" method="post" class="links-redirect">Internal Redirect Link</Link>
    <span @click="redirect" class="visits-redirect">Manual Redirect visit</span>

    <Link href="/redirect-external" method="post" class="links-redirect-external">External Redirect Link</Link>
    <span @click="redirectExternal" class="visits-redirect-external">Manual External Redirect visit</span>
  </div>
</template>
