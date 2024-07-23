<script setup>
import { router } from '@inertiajs/vue3'

const replace = () => {
  router.visit('/dump/get', {
    replace: true,
  })
}

const replaceFalse = () => {
  router.visit('/dump/get', {
    replace: false,
  })
}

const replaceGet = () => {
  router.get(
    '/dump/get',
    {},
    {
      replace: true,
    },
  )
}

const replaceGetFalse = () => {
  router.get(
    '/dump/get',
    {},
    {
      replace: false,
    },
  )
}
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates manual replace</span>

    <span @click="replace" class="replace">[State] Replace visit: true</span>
    <span @click="replaceFalse" class="replace-false">[State] Replace visit: false</span>
    <span @click="replaceGet" class="replace-get">[State] Replace GET: true</span>
    <span @click="replaceGetFalse" class="replace-get-false">[State] Replace GET: false</span>
  </div>
</template>
