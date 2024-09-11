<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  export let appName
  export let user
</script>

<svelte:head>
  <title>User - {appName}</title>
</svelte:head>

<h1 class="text-3xl">User</h1>

<p class="mt-6">You successfully created a new user! Well not really, there is no persistence in this app.</p>

<ul class="mt-6 space-y-2">
  <li><strong>Name:</strong> {user.name}</li>
  <li><strong>Company:</strong> {user.company}</li>
  <li><strong>Role:</strong> {user.role}</li>
</ul>
