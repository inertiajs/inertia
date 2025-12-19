<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import ChildComponent from './ChildComponent.vue'
import NestedComponent from './NestedComponent.vue'
import OutsideFormComponent from './OutsideFormComponent.vue'
</script>

<template>
  <Form action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors }">
    <div>
      <span>Parent: Form is {{ isDirty ? 'dirty' : 'clean' }}</span>
      <span v-if="hasErrors"> | Parent: Form has errors</span>
      <span v-if="errors.name"> | {{ errors.name }}</span>
    </div>

    <input type="text" name="name" value="John Doe" />
    <input type="email" name="email" value="john@example.com" />

    <ChildComponent />
    <NestedComponent />
  </Form>

  <OutsideFormComponent />
</template>
