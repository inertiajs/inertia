<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition - Touch, Reset & Validate</h1>

  <Form action="/precognition/default" method="post" validationTimeout={100}>
    {#snippet children({ invalid, errors, validate, touch, touched, validating, reset })}
      <div>
        <input name="name" placeholder="Name" onblur={() => touch('name')} />
        {#if invalid('name')}
          <p>{errors.name}</p>
        {/if}
      </div>

      <div>
        <input name="email" placeholder="Email" onblur={() => touch('email')} />
        {#if invalid('email')}
          <p>{errors.email}</p>
        {/if}
      </div>

      {#if validating}
        <p>Validating...</p>
      {/if}

      <p id="name-touched">{touched('name') ? 'Name is touched' : 'Name is not touched'}</p>
      <p id="email-touched">{touched('email') ? 'Email is touched' : 'Email is not touched'}</p>
      <p id="any-touched">{touched() ? 'Form has touched fields' : 'Form has no touched fields'}</p>

      <button type="button" onclick={() => validate()}>Validate All Touched</button>
      <button type="button" onclick={() => validate('name')}>Validate Name</button>
      <button type="button" onclick={() => validate({ only: ['name', 'email'] })}>Validate Name and Email</button>
      <button type="button" onclick={() => touch('name', 'email')}>Touch Name and Email</button>
      <button
        type="button"
        onclick={() => {
          touch('name')
          touch('name')
        }}
      >
        Touch Name Twice
      </button>
      <button type="button" onclick={() => reset()}>Reset All</button>
      <button type="button" onclick={() => reset('name')}>Reset Name</button>
      <button type="button" onclick={() => reset('name', 'email')}>Reset Name and Email</button>
    {/snippet}
  </Form>
</div>
