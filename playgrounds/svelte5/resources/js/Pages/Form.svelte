<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { useForm } from '@inertiajs/svelte5'

  export let appName

  let form = useForm('NewUser', {
    name: '',
    company: '',
    role: '',
  })

  function submit(e) {
    e.preventDefault()

    form.post('/user')
  }
</script>

<svelte:head>
  <title>Form - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Form</h1>

<form onsubmit={submit} class="mt-6 max-w-md space-y-4">
  {#if form.isDirty}
    <div class="my-5 rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">There are unsaved changes!</div>
  {/if}
  <div>
    <label class="block" for="name">Name:</label>
    <input
      type="text"
      bind:value={form.name}
      id="name"
      class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
    />
    {#if form.errors.name}
      <div class="mt-2 text-sm text-red-600">{form.errors.name}</div>
    {/if}
  </div>
  <div>
    <label class="block" for="company">Company:</label>
    <input
      type="text"
      bind:value={form.company}
      id="company"
      class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
    />
    {#if form.errors.company}
      <div class="mt-2 text-sm text-red-600">{form.errors.company}</div>
    {/if}
  </div>
  <div>
    <label class="block" for="role">Role:</label>
    <select bind:value={form.role} id="role" class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm">
      <option></option>
      <option>User</option>
      <option>Admin</option>
      <option>Super</option>
    </select>
    {#if form.errors.role}
      <div class="mt-2 text-sm text-red-600">{form.errors.role}</div>
    {/if}
  </div>
  <div class="flex gap-4">
    <button type="submit" disabled={form.processing} class="rounded bg-slate-800 px-6 py-2 text-white"> Submit </button>
    <button type="button" onclick={() => form.reset()}>Reset</button>
  </div>
</form>
