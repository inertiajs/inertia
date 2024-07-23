<script setup>
import { Link, router } from '@inertiajs/vue3'
import { onMounted } from 'vue'

defineProps({
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

onMounted(() => {
  setTimeout(() => {
    // window._inertia_page_key = window.testing.vue._.vnode.key
    console.log(window.testing.vue._.props)
  })
})
</script>

<template>
  <div>
    <span class="text">This is the Test App Entrypoint page</span>

    <Link href="/links/method" class="links-method">Basic Links</Link>
    <Link href="/links/replace" class="links-replace">'Replace' Links</Link>

    <span @click="visitsMethod" class="visits-method">Manual basic visits</span>
    <span @click="visitsReplace" class="visits-replace">Manual 'Replace' visits</span>

    <Link href="/redirect" method="post" class="links-redirect">Redirect Link</Link>
    <span @click="redirect" class="visits-redirect">Manual Redirect visit</span>

    <Link href="/redirect-external" method="post" class="links-redirect-external">Redirect Link</Link>
    <span @click="redirectExternal" class="visits-redirect-external">Manual External Redirect visit</span>
  </div>
</template>
