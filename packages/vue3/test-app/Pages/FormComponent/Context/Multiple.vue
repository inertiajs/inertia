<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import ChildComponent from './ChildComponent.vue'
</script>

<template>
  <Form action="/dump/post" method="post" #default="{ isDirty, errors }">
    <div>
      <span>Form 1 Parent: {{ isDirty ? 'dirty' : 'clean' }}</span>
      <span v-if="errors.name"> | Error: {{ errors.name }}</span>
    </div>
    <input type="text" name="name" value="Form 1 Name" />
    <ChildComponent form-id="form1" />
  </Form>

  <Form action="/dump/post" method="post" #default="{ isDirty, errors }">
    <div>
      <span>Form 2 Parent: {{ isDirty ? 'dirty' : 'clean' }}</span>
      <span v-if="errors.name"> | Error: {{ errors.name }}</span>
    </div>
    <input type="text" name="name" value="Form 2 Name" />
    <ChildComponent form-id="form2" />
  </Form>
</template>
