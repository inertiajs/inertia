<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition Touch</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:touch
    let:validating
  >
    {#if validating}
      <p>Validating...</p>
    {/if}

    <div>
      <input name="name" on:blur={() => touch('name')} />
      {#if invalid('name')}
        <p>{errors.name}</p>
      {/if}
    </div>

    <div>
      <input name="email" on:blur={() => touch('email')} />
      {#if invalid('email')}
        <p>{errors.email}</p>
      {/if}
    </div>

    <button type="button" on:click={() => validate()}>Validate All Touched</button>
    <button type="button" on:click={() => touch(['name', 'email'])}>Touch Name and Email</button>
    <button
      type="button"
      on:click={() => {
        touch('name')
        touch('name')
      }}
    >
      Touch Name Twice
    </button>
  </Form>
</div>
