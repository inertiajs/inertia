<script module>
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { Form } from '@inertiajs/svelte'

  let { appName, foo, bar, quux } = $props()

  let customHeaders = $state({ 'X-Custom-Header': 'Demo-Value' })
  let errorBag = 'custom-bag'
</script>

<svelte:head>
  <title>Form Component - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Form Component</h1>

<!-- Main Demo Form -->
<Form
  action="/form-component"
  method="post"
  headers={customHeaders}
  {errorBag}
  options={{
    only: ['foo'],
    reset: ['bar'],
  }}
  transform={(data) => ({ ...data, demo: 'data' })}
  class="mt-6 max-w-2xl space-y-6"
>
  {#snippet children({
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    setError,
    clearErrors,
    isDirty,
    reset,
    submit,
  })}
    <!-- Status Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Form Status</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          isDirty: <span class="font-mono" class:text-orange-600={isDirty} class:text-gray-500={!isDirty}
            >{isDirty}</span
          >
        </div>
        <div>
          hasErrors: <span class="font-mono" class:text-red-600={hasErrors} class:text-gray-500={!hasErrors}
            >{hasErrors}</span
          >
        </div>
        <div>
          processing: <span class="font-mono" class:text-blue-600={processing} class:text-gray-500={!processing}
            >{processing}</span
          >
        </div>
        <div>
          wasSuccessful: <span
            class="font-mono"
            class:text-green-600={wasSuccessful}
            class:text-gray-500={!wasSuccessful}>{wasSuccessful}</span
          >
        </div>
        <div>
          recentlySuccessful: <span
            class="font-mono"
            class:text-green-600={recentlySuccessful}
            class:text-gray-500={!recentlySuccessful}>{recentlySuccessful}</span
          >
        </div>
        {#if progress}
          <div>
            progress: <span class="font-mono text-blue-600">{Math.round(progress.percentage)}%</span>
          </div>
        {/if}
      </div>
    </div>

    {#if isDirty}
      <div class="rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">There are unsaved changes!</div>
    {/if}

    <!-- Form Fields -->
    <div class="space-y-4">
      <!-- Text Input -->
      <div>
        <label class="block font-medium" for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter your name"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          class:border-red-500={errors.name}
        />
        {#if errors.name}
          <div class="mt-1 text-sm text-red-600">{errors.name}</div>
        {/if}
      </div>

      <!-- File Input -->
      <div>
        <label class="block font-medium" for="avatar">Avatar</label>
        <input
          type="file"
          name="avatar"
          id="avatar"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
        />
        {#if errors.avatar}
          <div class="mt-1 text-sm text-red-600">{errors.avatar}</div>
        {/if}
      </div>

      <!-- Multiple Select -->
      <div>
        <label class="block font-medium" for="skills">Skills (Multiple)</label>
        <select
          name="skills[]"
          id="skills"
          multiple
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
        >
          <option value="vue">Vue.js</option>
          <option value="react">React</option>
          <option value="laravel">Laravel</option>
          <option value="tailwind">Tailwind CSS</option>
        </select>
        {#if errors.skills}
          <div class="mt-1 text-sm text-red-600">{errors.skills}</div>
        {/if}
      </div>

      <!-- Array Input (Tags) -->
      <div>
        <label class="block font-medium">Tags</label>
        <div class="mt-1 space-y-2">
          <input
            type="text"
            name="tags[]"
            placeholder="Tag 1"
            class="w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {#if errors['tags.0']}
            <div class="text-sm text-red-600">{errors['tags.0']}</div>
          {/if}
          <input
            type="text"
            name="tags[]"
            placeholder="Tag 2"
            class="w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {#if errors['tags.1']}
            <div class="text-sm text-red-600">{errors['tags.1']}</div>
          {/if}
        </div>
      </div>

      <!-- Nested Object Input -->
      <div>
        <label class="block font-medium">Address</label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <input
            type="text"
            name="user[address][street]"
            placeholder="Street"
            class="appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <input
            type="text"
            name="user[address][city]"
            placeholder="City"
            class="appearance-none rounded border px-2 py-1 shadow-sm"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2">
      <button type="submit" disabled={processing} class="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50">
        Submit
      </button>

      <button type="button" onclick={reset} class="rounded bg-gray-500 px-4 py-2 text-white"> Reset </button>

      <button
        type="button"
        onclick={() => setError({ name: 'Name is required', avatar: 'Please select a file' })}
        class="rounded bg-red-500 px-4 py-2 text-white"
      >
        Set Errors
      </button>

      <button type="button" onclick={() => clearErrors()} class="rounded bg-green-500 px-4 py-2 text-white">
        Clear Errors
      </button>
    </div>
  {/snippet}
</Form>

<!-- Form Configuration -->
<div class="mt-8 max-w-2xl space-y-4">
  <h2 class="text-2xl">Form Configuration</h2>

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <div class="space-y-1 text-sm">
        <div>
          <strong>Headers:</strong> <code class="text-xs">{JSON.stringify(customHeaders)}</code>
        </div>
        <div>
          <strong>Error Bag:</strong> <code>{errorBag}</code>
        </div>
        <div><strong>Only:</strong> <code>['foo']</code></div>
        <div><strong>Reset:</strong> <code>['bar']</code></div>
        <div><strong>Method:</strong> <code>POST</code></div>
      </div>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium">Error Bag</label>
        <input
          type="text"
          bind:value={errorBag}
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          placeholder="Error bag name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Custom Header Value</label>
        <input
          type="text"
          bind:value={customHeaders['X-Custom-Header']}
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          placeholder="Header value"
        />
      </div>
    </div>
  </div>
</div>
