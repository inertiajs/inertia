<script lang="ts">
  import { Form, Link, useForm } from '@inertiajs/svelte'

  const form = useForm({ name: 'foo' }).preventNavigationWhenDirty()
</script>

<div>
  <div id="dirty-status">Form is {form.isDirty ? 'dirty' : 'clean'}</div>

  <label>
    Name
    <input type="text" id="name" bind:value={form.name} />
  </label>

  <button type="button" class="submit" onclick={() => form.post('/form-helper/prevent-navigation-when-dirty')}>
    Submit form
  </button>

  <Link href="/form-helper/data" id="navigate-away">Navigate away</Link>

  <Form
    action="/form-helper/prevent-navigation-when-dirty"
    method="post"
    preventNavigationWhenDirty={true}
    id="guarded-form"
  >
    {#snippet children({ isDirty, processing })}
      <div id="form-component-dirty-status">Form component is {isDirty ? 'dirty' : 'clean'}</div>
      <input type="text" name="title" id="form-title" value="initial" />
      <button type="submit" disabled={processing}>Submit guarded form</button>
    {/snippet}
  </Form>

  <Link href="/form-helper/data" id="navigate-away-from-form">Navigate away from form</Link>
</div>
