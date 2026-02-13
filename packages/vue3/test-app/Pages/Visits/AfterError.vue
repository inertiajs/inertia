<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const visitDump = (e: Event) => {
  e.preventDefault()
  router.visit('/dump/get')
}

const throwErrorOnSuccess = (e: Event) => {
  e.preventDefault()

  router.visit('/visits/after-error/2', {
    onSuccess: () => {
      throw new Error('Error after visit')
    },
  })
}
</script>

<template>
  <div>
    <a href="#" @click.prevent="visitDump"> Visit dump page </a>

    <a href="#" @click.prevent="throwErrorOnSuccess"> Throw error on success </a>
  </div>
</template>
