<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import ChildComponent from './Context/ChildComponent.vue'
import NestedComponent from './Context/NestedComponent.vue'
import OutsideFormComponent from './Context/OutsideFormComponent.vue'
</script>

<template>
  <div>
    <h1>Form Context Test</h1>

    <Form action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors, processing }">
      <!-- Parent form state display -->
      <div id="parent-state">
        <div>Parent: Form is <span v-if="isDirty">dirty</span><span v-else>clean</span></div>
        <div v-if="hasErrors">Parent: Form has errors</div>
        <div v-if="processing">Parent: Form is processing</div>
        <div v-if="errors.name" id="parent_error_name">Parent Error: {{ errors.name }}</div>
      </div>

      <div>
        <label for="name">Name</label>
        <input type="text" name="name" id="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" placeholder="Email" value="john@example.com" />
      </div>

      <div>
        <button type="submit" id="submit-button">Submit via Form</button>
      </div>

      <!-- Child component that uses useFormContext -->
      <ChildComponent />

      <!-- Nested child component to test deep context propagation -->
      <NestedComponent />
    </Form>

    <!-- Component outside the Form to test undefined context -->
    <OutsideFormComponent />

    <div>
      <h2>Instructions</h2>
      <p>
        This test demonstrates that child components can access the form context using useFormContext(). Both the parent
        form and child components should display the same form state.
      </p>
      <ul>
        <li>Child components inside the Form should have access to form state and methods</li>
        <li>Context should propagate through multiple levels of nesting</li>
        <li>Components outside the Form should receive undefined from useFormContext()</li>
      </ul>
    </div>
  </div>
</template>
