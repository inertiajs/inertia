<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { isEqual } from 'lodash-es'

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  const handleBeforeValidation = (
    newRequest: { data: Record<string, unknown> | null; touched: string[] },
    oldRequest: { data: Record<string, unknown> | null; touched: string[] },
  ) => {
    const payloadIsCorrect =
      isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
      isEqual(oldRequest, { data: {}, touched: [] })

    if (payloadIsCorrect && newRequest.data?.name === 'block') {
      return false
    }

    return true
  }
</script>

<div>
  <div>
    <input
      bind:value={form.name}
      name="name"
      placeholder="Name"
      onblur={() =>
        form.validate('name', {
          onBeforeValidation: handleBeforeValidation,
        })}
    />
    {#if form.invalid('name')}
      <p>
        {form.errors.name}
      </p>
    {/if}
    {#if form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  <div>
    <input bind:value={form.email} name="email" placeholder="Email" onblur={() => form.validate('email')} />
    {#if form.invalid('email')}
      <p>
        {form.errors.email}
      </p>
    {/if}
    {#if form.valid('email')}<p>Email is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}
</div>
