<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  interface Props {
    user: {
      name: string
    }
  }

  let { user }: Props = $props()
</script>

<Form action="/form-component/default-value" method="patch">
  {#snippet children({ errors })}
    <h1>Form Default Values</h1>

    <div>
      <label for="name">Name</label>
      <input type="text" name="name" id="name" value={user.name} />
      <div id="error_name">{errors['user.name']}</div>
    </div>

    <button type="submit">Submit</button>
  {/snippet}
</Form>
