<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import type { NamedInputEvent } from 'laravel-precognition'

  const form = useForm({
    name: '',
    email: '',
    company: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  const onCompanyFocus = (e: FocusEvent) => {
    const event = e as any as NamedInputEvent // eslint-disable-line @typescript-eslint/no-explicit-any
    form.forgetError(event)
    form.touch(event)
  }
</script>

<div>
  <h1>Compatibility Test Page</h1>

  <div>
    <input bind:value={form.name} name="name" placeholder="Name" onblur={() => form.validate('name')} />
    {#if form.invalid('name')}
      <p id="name-error">{form.errors.name}</p>
    {/if}
    {#if form.valid('name')}
      <p id="name-valid">Name is valid!</p>
    {/if}
  </div>

  <div>
    <input bind:value={form.email} name="email" placeholder="Email" onblur={() => form.validate('email')} />
    {#if form.invalid('email')}
      <p id="email-error">{form.errors.email}</p>
    {/if}
    {#if form.valid('email')}
      <p id="email-valid">Email is valid!</p>
    {/if}
  </div>

  <div>
    <input
      bind:value={form.company}
      name="company"
      placeholder="Company"
      onfocus={onCompanyFocus}
      onblur={() => form.validate('company')}
    />
    {#if form.invalid('company')}
      <p id="company-error">{form.errors.company}</p>
    {/if}
    {#if form.valid('company')}
      <p id="company-valid">company is valid!</p>
    {/if}
  </div>

  {#if form.validating}
    <p id="validating">Validating...</p>
  {/if}

  <!-- Test compatibility methods -->
  <div style="margin-top: 20px">
    <button
      type="button"
      id="test-setErrors"
      onclick={() =>
        form.setErrors({ name: 'setErrors test', email: 'setErrors email test', company: 'setErrors company test' })}
    >
      Test setErrors()
    </button>

    <button type="button" id="test-forgetError" onclick={() => form.forgetError('name')}> Test forgetError() </button>

    <button type="button" id="test-touch-array" onclick={() => form.touch(['name', 'email'])}> Test touch([]) </button>

    <button type="button" id="test-touch-spread" onclick={() => form.touch('name', 'email')}>
      Test touch(...args)
    </button>
  </div>

  <div style="margin-top: 20px">
    <p id="touched-name">Name touched: {form.touched('name') ? 'yes' : 'no'}</p>
    <p id="touched-email">Email touched: {form.touched('email') ? 'yes' : 'no'}</p>
    <p id="touched-company">Company touched: {form.touched('company') ? 'yes' : 'no'}</p>
    <p id="touched-any">Any touched: {form.touched() ? 'yes' : 'no'}</p>
  </div>
</div>
