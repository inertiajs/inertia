<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<h1>Form with Default Values</h1>

<Form
  action="/dump/post"
  method="post"
  defaultValues={{
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    newsletter: true,
    preferences: 'option2',
  }}
  let:isDirty
  let:hasErrors
  let:errors
>
  <!-- State display for testing -->
  <div>Form is {isDirty ? 'dirty' : 'clean'}</div>
  {#if hasErrors}<div>Form has errors</div>{/if}
  {#if errors.name}<div id="error_name">{errors.name}</div>{/if}

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
