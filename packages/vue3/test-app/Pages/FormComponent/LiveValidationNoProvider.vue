<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognitive Without Provider</h1>

    <Form action="/dump/post" method="post" :precognitive="true" validateOn="input" v-slot="{ errors }">
      <div>
        <label for="np_name">Name</label>
        <input id="np_name" name="name" data-precognitive="true" />
        <div id="np_error_name">{{ errors.name }}</div>
      </div>
    </Form>
  </div>
</template>
