<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const transitionWithBoolean = () => {
  router.visit('/view-transition/page-b', {
    viewTransition: true,
  })
}

const transitionWithCallback = () => {
  router.visit('/view-transition/page-b', {
    viewTransition: (viewTransition) => {
      viewTransition.ready.then(() => {
        console.log('ready')
      })

      viewTransition.updateCallbackDone.then(() => {
        console.log('updateCallbackDone')
      })

      viewTransition.finished.then(() => {
        console.log('finished')
      })
    },
  })
}
</script>

<template>
  <h1>Page A - View Transition Test</h1>

  <button @click="transitionWithBoolean">Transition with boolean</button>
  <button @click="transitionWithCallback">Transition with callback</button>
</template>
