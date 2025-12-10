<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script lang="ts">
  import type { FormComponentMethods } from '@inertiajs/core'
  import { Form } from '@inertiajs/svelte'

  let { appName } = $props()

  let validateFiles = $state(false)
  let validationTimeout = $state(1500)

  let callbacks = $state({
    success: false,
    error: false,
    finish: false,
  })

  const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
    callbacks = { success: false, error: false, finish: false }

    validate({
      onPrecognitionSuccess: () => (callbacks.success = true),
      onValidationError: () => (callbacks.error = true),
      onFinish: () => (callbacks.finish = true),
      onBeforeValidation: (newReq) => {
        if (newReq.data?.name === 'block') {
          alert('Validation blocked by onBeforeValidation!')
          return false
        }
      },
    })
  }
</script>

<svelte:head>
  <title>Form Component Precognition - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Form Component Precognition</h1>

<Form action="/form-component/precognition" method="post" {validateFiles} {validationTimeout} class="mt-6 max-w-2xl space-y-6">
  {#snippet children({ errors, invalid, valid, validate, validating, touch, touched, processing })}
    <!-- Status Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Validation Status (slot props)</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          validating:
          <span class="font-mono" class:text-blue-600={validating} class:text-gray-500={!validating}>{validating}</span>
        </div>
        <div>
          processing:
          <span class="font-mono" class:text-blue-600={processing} class:text-gray-500={!processing}>{processing}</span>
        </div>
        <div>
          touched():
          <span class="font-mono" class:text-orange-600={touched()} class:text-gray-500={!touched()}>{touched()}</span>
        </div>
        <div>
          touched('name'):
          <span class="font-mono" class:text-orange-600={touched('name')} class:text-gray-500={!touched('name')}
            >{touched('name')}</span
          >
        </div>
        <div>
          touched('email'):
          <span class="font-mono" class:text-orange-600={touched('email')} class:text-gray-500={!touched('email')}
            >{touched('email')}</span
          >
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <!-- Name Input -->
      <div>
        <label class="block font-medium" for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter your name (min 3 chars)"
          onblur={() => validate('name')}
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          class:border-red-500={invalid('name')}
          class:border-green-500={valid('name')}
        />
        {#if invalid('name')}
          <div class="mt-1 text-sm text-red-600">{errors.name}</div>
        {/if}
        {#if valid('name')}
          <div class="mt-1 text-sm text-green-600">Valid!</div>
        {/if}
      </div>

      <!-- Email Input -->
      <div>
        <label class="block font-medium" for="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          onblur={() => validate('email')}
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          class:border-red-500={invalid('email')}
          class:border-green-500={valid('email')}
        />
        {#if invalid('email')}
          <div class="mt-1 text-sm text-red-600">{errors.email}</div>
        {/if}
        {#if valid('email')}
          <div class="mt-1 text-sm text-green-600">Valid!</div>
        {/if}
      </div>

      <!-- File Input -->
      <div>
        <label class="block font-medium" for="avatar">Avatar</label>
        <input
          type="file"
          name="avatar"
          id="avatar"
          onchange={() => validate('avatar')}
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          class:border-red-500={invalid('avatar')}
          class:border-green-500={valid('avatar')}
        />
        {#if invalid('avatar')}
          <div class="mt-1 text-sm text-red-600">{errors.avatar}</div>
        {/if}
        {#if valid('avatar')}
          <div class="mt-1 text-sm text-green-600">Valid!</div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2">
      <button type="submit" disabled={processing} class="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50">
        Submit
      </button>

      <button type="button" onclick={() => validate()} class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50">
        Validate Touched
      </button>

      <button type="button" onclick={() => touch('name')} class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50">
        Touch Name
      </button>

      <button
        type="button"
        onclick={() => validateWithCallbacks(validate)}
        class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
      >
        Validate with Callbacks
      </button>
    </div>

    <!-- Callbacks Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Validation Callbacks</h3>
      <p class="mb-3 text-sm text-gray-600">Enter "block" in the name field to test onBeforeValidation blocking.</p>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          onPrecognitionSuccess:
          <span class="font-mono" class:text-green-600={callbacks.success} class:text-gray-500={!callbacks.success}
            >{callbacks.success}</span
          >
        </div>
        <div>
          onValidationError:
          <span class="font-mono" class:text-red-600={callbacks.error} class:text-gray-500={!callbacks.error}
            >{callbacks.error}</span
          >
        </div>
        <div>
          onFinish:
          <span class="font-mono" class:text-blue-600={callbacks.finish} class:text-gray-500={!callbacks.finish}
            >{callbacks.finish}</span
          >
        </div>
      </div>
    </div>
  {/snippet}
</Form>

<!-- Configuration -->
<div class="mt-8 max-w-2xl space-y-4">
  <h2 class="text-2xl">Configuration</h2>

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <div class="space-y-1 text-sm">
        <div>
          <strong>Validate Files:</strong> <code>{validateFiles}</code>
        </div>
        <div>
          <strong>Validation Timeout:</strong> <code>{validationTimeout}ms</code>
        </div>
        <div><strong>Method:</strong> <code>POST</code></div>
      </div>
    </div>

    <div class="space-y-3">
      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={validateFiles} class="rounded" />
          <span class="text-sm">Enable file validation</span>
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium">Validation Timeout</label>
        <select bind:value={validationTimeout} class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm">
          <option value={500}>500ms</option>
          <option value={1000}>1000ms</option>
          <option value={1500}>1500ms</option>
          <option value={2000}>2000ms</option>
        </select>
      </div>
    </div>
  </div>
</div>
