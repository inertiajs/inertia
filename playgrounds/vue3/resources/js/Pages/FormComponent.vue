<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Form Component" />
  <h1 class="text-3xl">Form Component</h1>

  <Form
    method="post"
    action="/form-component"
    #default="{ errors, reset, isDirty, processing }"
    :data="{ additional: 'data' }"
    class="mt-6 max-w-md space-y-4"
  >
    <div v-if="isDirty" class="my-5 rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">
      There are unsaved changes!
    </div>

    <div class="space-y-4 *:w-full *:border *:p-2">
      <!-- Text input -->
      <input type="text" name="name" id="name" placeholder="Name" />

      <!-- Select -->
      <select name="role" id="role">
        <option value="" disabled selected>Role</option>
        <option>User</option>
        <option>Admin</option>
        <option>Super</option>
      </select>

      <!-- Radio buttons -->
      <div class="flex gap-4">
        <label><input type="radio" name="plan" value="free" /> Free</label>
        <label><input type="radio" name="plan" value="pro" /> Pro</label>
        <label><input type="radio" name="plan" value="enterprise" /> Enterprise</label>
      </div>

      <!-- Checkbox (single) -->
      <div>
        <input type="checkbox" name="subscribe" value="yes" id="subscribe" />
        <label for="subscribe">Subscribe to newsletter</label>
      </div>

      <!-- Checkbox (multiple) -->
      <div class="flex gap-4">
        <label><input type="checkbox" name="interests[]" value="sports" /> Sports</label>
        <label><input type="checkbox" name="interests[]" value="music" /> Music</label>
        <label><input type="checkbox" name="interests[]" value="tech" /> Tech</label>
      </div>

      <!-- Multiple select -->
      <select name="skills[]" id="skills" multiple>
        <option disabled selected>Skills</option>
        <option value="vue">Vue</option>
        <option value="react">React</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>

      <!-- File input (single) -->
      <input type="file" name="avatar" id="avatar" placeholder="Avatar" />

      <!-- File input (multiple) -->
      <input type="file" name="documents[]" id="documents" multiple placeholder="Documents" />

      <!-- Textarea -->
      <textarea name="bio" id="bio" rows="3" placeholder="Bio"></textarea>

      <!-- Hidden input -->
      <input type="hidden" name="token" value="abc123" />

      <!-- Number input -->
      <input type="number" name="age" id="age" placeholder="Age" />

      <!-- Deep nested input -->
      <input type="text" name="user[address][street]" placeholder="Street" />

      <!-- Indexed array of objects -->
      <input type="text" name="items[0][name]" value="Item A" />
      <input type="text" name="items[1][name]" value="Item B" />

      <!-- Disabled input (should be ignored) -->
      <input type="text" name="disabled_field" value="Ignore me" disabled />
    </div>

    <!-- Errors -->
    <div v-for="(error, field) in errors" :key="field" class="mt-2 text-red-600">{{ field }}: {{ error }}</div>

    <div class="flex gap-4">
      <button type="submit" :disabled="processing" class="rounded bg-slate-800 px-6 py-2 text-white">Submit</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </Form>
</template>
