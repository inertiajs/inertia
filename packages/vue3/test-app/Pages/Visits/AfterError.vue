<template>
  <div>
    <a href="#" @click="visitDump">
      Visit dump page
    </a>

    <a href="#" @click="throwErrorOnSuccess">
      Throw error on success
    </a>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3'

const visitDump = (e) => {
  e.preventDefault()
  router.visit('/dump/get')
}

const throwErrorOnSuccess = (e) => {
  e.preventDefault()

  router.visit('/visits/after-error/2', {
    onSuccess: () => {
      throw new Error('Error after visit')
    }
  })
}
</script>