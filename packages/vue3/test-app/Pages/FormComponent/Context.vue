<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import ChildComponent from './Context/ChildComponent.vue'
import NestedComponent from './Context/NestedComponent.vue'
import OutsideFormComponent from './Context/OutsideFormComponent.vue'
</script>

<template>
  <Form action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors }">
    <div id="parent-state">
      <span>Parent: Form is {{ isDirty ? 'dirty' : 'clean' }}</span>
      <span v-if="hasErrors"> | Parent: Form has errors</span>
      <span v-if="errors.name" id="parent_error_name"> | {{ errors.name }}</span>
    </div>

    <input type="text" name="name" id="name" value="John Doe" />
    <input type="email" name="email" id="email" value="john@example.com" />

    <ChildComponent />
    <NestedComponent />
  </Form>

  <OutsideFormComponent />
</template>
