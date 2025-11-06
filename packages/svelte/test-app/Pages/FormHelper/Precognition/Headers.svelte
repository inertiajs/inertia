<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
  })
    .withPrecognition('post', '/precognition/headers')
    .setValidationTimeout(100)
</script>

<div>
  <div>
    <input
      bind:value={$form.name}
      name="name"
      placeholder="Name"
      on:blur={() =>
        $form.validate('name', {
          headers: { 'X-Custom-Header': 'custom-value' },
        })}
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
