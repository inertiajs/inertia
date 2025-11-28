<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script lang="ts">
  import type { FormComponentMethods } from '@inertiajs/core'

  import { Form } from '@inertiajs/svelte'

  let { appName } = $props()

  let callbacks = $state({
    success: false,
    error: false,
    finish: false,
  })

  const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
    callbacks = {
      success: false,
      error: false,
      finish: false,
    }

    validate({
      onPrecognitionSuccess: () => (callbacks.success = true),
      onValidationError: () => (callbacks.error = true),
      onFinish: () => (callbacks.finish = true),
      onBeforeValidation: (newReq, oldReq) => {
        // Prevent validation if name is 'block'
        if (newReq.data?.name === 'block') {
          alert('Validation blocked by onBefore!')
          return false
        }
      },
    })
  }

  let validateFiles = $state(false)
  let validationTimeout = $state(1500)
</script>

<svelte:head>
  <title>Precognition - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Form Precognition</h1>

<!-- Live Validation & File Uploads -->
<div class="mt-6 max-w-2xl space-y-6">
  <div class="rounded border border-gray-200 bg-gray-50 p-4">
    <h3 class="mb-3 text-lg font-medium">Live Validation & File Uploads</h3>

    <!-- Configuration Toggle -->
    <div class="mb-3 flex items-center gap-4">
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={validateFiles} class="rounded" />
        <span class="text-sm">Enable file validation</span>
      </label>
      <div class="flex items-center gap-2">
        <label class="text-sm">Timeout:</label>
        <select bind:value={validationTimeout} class="rounded border px-2 py-1 text-sm">
          <option value={500}>500ms</option>
          <option value={1000}>1000ms</option>
          <option value={1500}>1500ms</option>
          <option value={2000}>2000ms</option>
        </select>
      </div>
    </div>

    <Form action="/precognition/default" method="post" {validateFiles} {validationTimeout} class="space-y-4">
      {#snippet children({ errors, invalid, valid, validate, validating })}
        <p class="text-sm text-blue-600">Validating: {validating ? 'Yes...' : 'No'}</p>

        <div>
          <label for="name" class="block font-medium">Name</label>
          <input
            id="name"
            name="name"
            placeholder="Enter your name (min 3 chars)"
            onblur={() => validate('name')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            class:border-red-500={invalid('name')}
            class:border-green-500={valid('name')}
          />
          {#if invalid('name')}
            <p class="mt-1 text-sm text-red-600">{errors.name}</p>
          {/if}
          {#if valid('name')}
            <p class="mt-1 text-sm text-green-600">Valid!</p>
          {/if}
        </div>

        <div>
          <label for="email" class="block font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            onblur={() => validate('email')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            class:border-red-500={invalid('email')}
            class:border-green-500={valid('email')}
          />
          {#if invalid('email')}
            <p class="mt-1 text-sm text-red-600">{errors.email}</p>
          {/if}
          {#if valid('email')}
            <p class="mt-1 text-sm text-green-600">Valid!</p>
          {/if}
        </div>

        <div>
          <label for="avatar" class="block font-medium">Avatar</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            onchange={() => validate('avatar')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            class:border-red-500={invalid('avatar')}
            class:border-green-500={valid('avatar')}
          />
          {#if invalid('avatar')}
            <p class="mt-1 text-sm text-red-600">{errors.avatar}</p>
          {/if}
          {#if valid('avatar')}
            <p class="mt-1 text-sm text-green-600">Valid!</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">
            Files are validated during precognitive requests when validateFiles is enabled
          </p>
        </div>
      {/snippet}
    </Form>
  </div>

  <!-- Touch & Reset Methods -->
  <div class="rounded border border-gray-200 bg-gray-50 p-4">
    <h3 class="mb-3 text-lg font-medium">Touch & Reset Methods</h3>

    <Form action="/precognition/default" method="post" class="space-y-4">
      {#snippet children({ errors, invalid, validate, touch, touched, reset, validating })}
        <div>
          <label for="name2" class="block font-medium">Name</label>
          <input
            id="name2"
            name="name"
            placeholder="Name"
            onblur={() => touch('name')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {#if invalid('name')}
            <p class="mt-1 text-sm text-red-600">{errors.name}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">Touched: {touched('name')}</p>
        </div>

        <div>
          <label for="email2" class="block font-medium">Email</label>
          <input
            id="email2"
            name="email"
            type="email"
            placeholder="Email"
            onblur={() => touch('email')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {#if invalid('email')}
            <p class="mt-1 text-sm text-red-600">{errors.email}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">Touched: {touched('email')}</p>
        </div>

        {#if validating}
          <p class="text-sm text-blue-600">Validating...</p>
        {/if}

        <div class="flex flex-wrap gap-2">
          <button type="button" onclick={() => validate()} class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
            Validate
          </button>
          <button type="button" onclick={() => reset()} class="rounded bg-gray-600 px-3 py-1.5 text-sm text-white">
            Reset All
          </button>
          <button
            type="button"
            onclick={() => reset('name')}
            class="rounded bg-gray-600 px-3 py-1.5 text-sm text-white"
          >
            Reset Name
          </button>
        </div>

        <div class="rounded bg-gray-100 p-3 text-sm">
          <strong>Status:</strong>
          <ul class="mt-2 space-y-1 text-xs">
            <li>Any field touched: {touched()}</li>
            <li>Name touched: {touched('name')}</li>
            <li>Email touched: {touched('email')}</li>
          </ul>
        </div>
      {/snippet}
    </Form>
  </div>

  <!-- Validation Callbacks -->
  <div class="rounded border border-gray-200 bg-gray-50 p-4">
    <h3 class="mb-3 text-lg font-medium">Validation Callbacks</h3>

    <Form action="/precognition/default" method="post" class="space-y-4">
      {#snippet children({ errors, invalid, validate, touch, validating })}
        <div>
          <label for="name3" class="block font-medium">Name</label>
          <input
            id="name3"
            name="name"
            placeholder="Enter 'block' to prevent validation"
            onblur={() => touch('name')}
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {#if invalid('name')}
            <p class="mt-1 text-sm text-red-600">{errors.name}</p>
          {/if}
        </div>

        {#if validating}
          <p class="text-sm text-blue-600">Validating...</p>
        {/if}

        {#if callbacks.success || callbacks.error || callbacks.finish}
          <div class="rounded bg-gray-100 p-3">
            {#if callbacks.success}
              <p class="text-sm text-green-600">onPrecognitionSuccess called!</p>
            {/if}
            {#if callbacks.error}
              <p class="text-sm text-red-600">onValidationError called!</p>
            {/if}
            {#if callbacks.finish}
              <p class="text-sm text-blue-600">onFinish called!</p>
            {/if}
          </div>
        {/if}

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            onclick={() => validateWithCallbacks(validate)}
            class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
          >
            Validate
          </button>
        </div>
      {/snippet}
    </Form>
  </div>
</div>
