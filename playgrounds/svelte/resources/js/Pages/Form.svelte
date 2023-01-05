<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  import { useForm } from '@inertiajs/svelte'

  let form = useForm('NewUser', {
    name: '',
    company: '',
    role: '',
  })

  function submit() {
    $form.post('/user')
  }
</script>

<svelte:head>
  <title>Form</title>
</svelte:head>

<h1 class="text-3xl">Form</h1>

<form on:submit|preventDefault={submit} class="mt-6 max-w-md space-y-4">
  <div>
    <label class="block" for="name">Name:</label>
    <input
      type="text"
      bind:value={$form.name}
      id="name"
      class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
    />
    {#if $form.errors.name}
      <div class="mt-2 text-sm text-red-600">{$form.errors.name}</div>
    {/if}
  </div>
  <div>
    <label class="block" for="company">Company:</label>
    <input
      type="text"
      bind:value={$form.company}
      id="company"
      class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
    />
    {#if $form.errors.company}
      <div class="mt-2 text-sm text-red-600">{$form.errors.company}</div>
    {/if}
  </div>
  <div>
    <label class="block" for="role">Role:</label>
    <select bind:value={$form.role} id="role" class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm">
      <option>User</option>
      <option>Admin</option>
      <option>Super</option>
    </select>
    {#if $form.errors.role}
      <div class="mt-2 text-sm text-red-600">{$form.errors.role}</div>
    {/if}
  </div>
  <div>
    <button type="submit" disabled={$form.processing} class="rounded bg-slate-800 px-6 py-2 text-white">
      Submit
    </button>
  </div>
</form>
