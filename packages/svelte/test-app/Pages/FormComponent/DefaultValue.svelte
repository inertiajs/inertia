<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  export let user: {
    name: string
  }
</script>

<Form action="/form-component/default-value" method="patch" let:errors>
  <h1>Form Default Values</h1>

  <div>
    <label for="name">Name</label>
    <input type="text" name="name" id="name" value={user.name} />
    <div id="error_name">{errors['user.name']}</div>
  </div>

  <button type="submit">Submit</button>
</Form>
