<script setup lang="ts">
import { QueryStringArrayFormatOption } from '@inertiajs/core'
import { config, Form } from '@inertiajs/vue3'

const props = defineProps<{
  queryStringArrayFormat: QueryStringArrayFormatOption | 'force-brackets'
}>()

const format = props.queryStringArrayFormat === 'force-brackets' ? 'brackets' : props.queryStringArrayFormat

if (props.queryStringArrayFormat === 'force-brackets') {
  config.set('form.forceIndicesArrayFormatInFormData', false)
}
</script>

<template>
  <Form action="/dump/post" method="post" v-slot="{ isDirty }" :queryStringArrayFormat="format">
    <h1>Form Elements</h1>
    <div>Form is <span v-if="isDirty">dirty</span><span v-else>clean</span></div>

    <!-- Text input -->
    <div>
      <input type="text" name="name" id="name" placeholder="Name" />
    </div>

    <!-- Select with default selected option -->
    <div>
      <select name="country" id="country">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk" selected>United Kingdom</option>
      </select>
    </div>

    <!-- Select with default disabled option -->
    <div>
      <select name="role" id="role">
        <option value="" disabled selected>Role</option>
        <option>User</option>
        <option>Admin</option>
        <option>Super</option>
      </select>
    </div>

    <!-- Radio buttons -->
    <div>
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
    <div>
      <label><input type="checkbox" name="interests[]" value="sports" /> Sports</label>
      <label><input type="checkbox" name="interests[]" value="music" /> Music</label>
      <label><input type="checkbox" name="interests[]" value="tech" /> Tech</label>
    </div>

    <!-- Multiple select -->
    <div>
      <select name="skills[]" id="skills" multiple>
        <option disabled selected>Skills</option>
        <option value="vue">Vue</option>
        <option value="react">React</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>
    </div>

    <!-- File input (single) -->

    <div>
      <input type="file" name="avatar" id="avatar" placeholder="Avatar" />
    </div>

    <!-- File input (multiple) -->
    <div>
      <input type="file" name="documents[]" id="documents" multiple placeholder="Documents" />
    </div>

    <!-- Textarea -->
    <div>
      <textarea name="bio" id="bio" rows="3" placeholder="Bio"></textarea>
    </div>

    <!-- Hidden input -->
    <div>
      <input type="hidden" name="token" id="token" value="abc123" />
    </div>

    <!-- Number input -->
    <div>
      <input type="number" name="age" id="age" placeholder="Age" />
    </div>

    <!-- Deep nested input -->
    <div>
      <input type="text" name="user[address][street]" id="nested_street" placeholder="Street" />
    </div>

    <!-- Indexed array of objects -->
    <div>
      <input type="text" name="items[0][name]" value="Item A" id="item_a" />
      <input type="text" name="items[1][name]" value="Item B" id="item_b" />
    </div>

    <!-- Disabled input (should be ignored) -->
    <div>
      <input type="text" name="disabled_field" value="Ignore me" disabled />
    </div>

    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
  </Form>
</template>
