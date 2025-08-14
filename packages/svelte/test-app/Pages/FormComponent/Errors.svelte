<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let errorBag: string | null = null
</script>

<Form
  action={errorBag ? '/form-component/errors/bag' : '/form-component/errors'}
  method="post"
  {errorBag}
  let:errors
  let:hasErrors
  let:setError
  let:clearErrors
>
  <h1>Form Errors</h1>

  {#if hasErrors}
    <div>Form has errors</div>
  {:else}
    <div>No errors</div>
  {/if}

  <div>
    <label for="name">Name</label>
    <input type="text" name="name" id="name" />
    <div id="error_name">{errors.name || ''}</div>
  </div>

  <div>
    <label for="handle">Handle</label>
    <input type="text" name="handle" id="handle" />
    <div id="error_handle">{errors.handle || ''}</div>
  </div>

  <div>
    <button
      type="button"
      on:click={() =>
        setError({
          name: 'The name field is required.',
          handle: 'The handle field is invalid.',
        })
      }
    >
      Set Errors
    </button>
    <button type="button" on:click={() => clearErrors()}>Clear Errors</button>
    <button type="button" on:click={() => clearErrors('name')}>Clear Name Error</button>
    <button type="button" on:click={() => errorBag = 'bag'}>Use Error Bag</button>
  </div>

  <button type="submit">Submit</button>
</Form>