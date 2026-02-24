<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const wayfinderObjectVisit = () => {
  router.visit({ url: '/dump/post', method: 'post' })
}

const wayfinderObjectMethodOverride = () => {
  router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })
}
</script>

<template>
  <div>
    <a href="#" @click.prevent="wayfinderObjectVisit" class="wayfinder-visit">Wayfinder object visit</a>
    <a href="#" @click.prevent="wayfinderObjectMethodOverride" class="wayfinder-method-override">
      Wayfinder object method override
    </a>
  </div>
</template>
