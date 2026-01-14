<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
  })
    .withPrecognition('post', '/precognition/default?slow=1')
    .setValidationTimeout(100)
</script>

<div>
  <div>
    <input
      id="auto-cancel-name-input"
      bind:value={$form.name}
      name="name"
      placeholder="Name"
      on:blur={() => $form.validate('name')}
    />
    {#if $form.invalid('name')}
      <p>
        {$form.errors.name}
      </p>
    {/if}
    {#if $form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  {#if $form.validating}<p>Validating...</p>{/if}
</div>
