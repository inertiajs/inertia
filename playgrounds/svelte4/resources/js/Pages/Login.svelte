<script context="module">
  export { default as layout } from '../Components/Layout.svelte'
</script>

<script>
  export let appName
</script>

<svelte:head>
  <title>Login - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Login</h1>

<p class="mt-6">You made a <code>POST</code> request to the logout endpoint and were redirected to the login page.</p>
