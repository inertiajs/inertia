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

    <a href="#" @click="replace" class="replace">[State] Replace visit: true</a>
    <a href="#" @click="replaceFalse" class="replace-false">[State] Replace visit: false</a>
    <a href="#" @click="replaceGet" class="replace-get">[State] Replace GET: true</a>
    <a href="#" @click="replaceGetFalse" class="replace-get-false">[State] Replace GET: false</a>
  </div>
</template>
