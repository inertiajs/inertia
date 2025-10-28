<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const transitionWithBoolean = () => {
  router.visit('/view-transition/page-b', {
    viewTransition: true,
  })
}

const transitionWithCallback = () => {
  router.visit('/view-transition/page-b', {
    viewTransition: (viewTransition) => {
      viewTransition.ready.then(() => console.log('ready'))
      viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
      viewTransition.finished.then(() => console.log('finished'))
    },
  })
}

const clientSideReplace = () => {
  router.replace({
    url: '/view-transition/page-b',
    component: 'ViewTransition/PageB',
    props: {},
    viewTransition: (viewTransition) => {
      viewTransition.ready.then(() => console.log('ready'))
      viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
      viewTransition.finished.then(() => console.log('finished'))
    },
  })
}
</script>

<template>
  <h1>Page A - View Transition Test</h1>

  <button @click="transitionWithBoolean">Transition with boolean</button>
  <button @click="transitionWithCallback">Transition with callback</button>
  <button @click="clientSideReplace">Client-side replace</button>
  <Link
    href="/view-transition/page-b"
    :view-transition="
      (viewTransition: ViewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      }
    "
    >Link to Page B</Link
  >
</template>
