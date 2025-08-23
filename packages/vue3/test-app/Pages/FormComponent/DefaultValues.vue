<template>
  <div>
    <h1>Form with Default Values</h1>

    <Form
      action="/dump/post"
      method="post"
      :default-values="{
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        newsletter: true,
        preferences: 'option2',
      }"
      #default="{ isDirty, hasErrors, errors }"
    >
      <!-- State display for testing -->
      <div>Form is <span v-if="isDirty">dirty</span><span v-else>clean</span></div>
      <div v-if="hasErrors">Form has errors</div>
      <div v-if="errors.name" id="error_name">{{ errors.name }}</div>

      <div>
        <label for="name">Name:</label>
        <input type="text" name="name" id="name" />
      </div>

      <div>
        <label for="email">Email:</label>
        <input type="email" name="email" id="email" />
      </div>

      <div>
        <label for="role">Role:</label>
        <select name="role" id="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      <div>
        <label>
          <input type="checkbox" name="newsletter" />
          Subscribe to newsletter
        </label>
      </div>

      <div>
        <label>Preferences:</label>
        <label>
          <input type="radio" name="preferences" value="option1" />
          Option 1
        </label>
        <label>
          <input type="radio" name="preferences" value="option2" />
          Option 2
        </label>
        <label>
          <input type="radio" name="preferences" value="option3" />
          Option 3
        </label>
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>
