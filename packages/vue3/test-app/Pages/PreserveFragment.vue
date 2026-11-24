<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const visitWithFragment = () => {
  router.visit('/preserve-fragment/redirect#my-fragment')
}

const getWithPreserveFragment = () => {
  router.get('/preserve-fragment', { status: 'open' }, { preserveFragment: true })
}

const getWithoutPreserveFragment = () => {
  router.get('/preserve-fragment', { status: 'open' })
}

const redirectWithPreserveFragment = () => {
  router.visit('/preserve-fragment/redirect-no-server-flag', { preserveFragment: true })
}
</script>

<template>
  <div>
    <span id="current-url">{{ $page.url }}</span>

    <Link href="/preserve-fragment/redirect#my-fragment" id="link-with-fragment">Link with fragment</Link>

    <a href="#" @click.prevent="visitWithFragment" id="manual-visit-with-fragment">Manual visit with fragment</a>

    <Link href="/preserve-fragment?status=open" preserve-fragment id="link-preserve-fragment">
      Link preserve fragment
    </Link>

    <a href="#" @click.prevent="getWithPreserveFragment" id="visit-preserve-fragment">Visit preserve fragment</a>

    <a href="#" @click.prevent="getWithoutPreserveFragment" id="visit-without-preserve-fragment">
      Visit without preserve fragment
    </a>

    <a href="#" @click.prevent="redirectWithPreserveFragment" id="redirect-preserve-fragment">
      Redirect preserve fragment
    </a>
  </div>
</template>
